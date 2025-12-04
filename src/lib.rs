mod models;

use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;
use crate::models::ui;
use crate::models::yaml;
use crate::models::api;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

#[wasm_bindgen]
pub fn new_pod() -> Result<JsValue, JsValue> {
    Ok(serde_wasm_bindgen::to_value(&ui::PodTemplate::new())?.into())
}

#[wasm_bindgen]
pub fn json_to_yaml(input: JsValue) -> Result<String, JsValue> {
    let json_value: ui::PodTemplate = serde_wasm_bindgen::from_value(input)?;

    let pod_yaml = yaml::PodTemplateYaml {
        api_version: json_value.api_version,
        kind: json_value.kind,
        metadata: json_value.metadata,
        spec: yaml::SpecYaml {
            containers: json_value.spec.containers
                .into_iter()
                .map(|container| yaml::ContainerYaml {
                    name: container.name,
                    image: container.image,
                    ports: container.ports,
                })
                .collect(),
        },
    };

    let yaml = serde_yaml::to_string(&pod_yaml).map_err(|e| JsValue::from(e.to_string()))?;
    Ok(yaml)
}

#[wasm_bindgen]
pub fn yaml_to_json(input: &str) -> Result<JsValue, JsValue> {
    let pod_yaml: yaml::PodTemplateYaml = serde_yaml::from_str(input).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let pod_json = ui::PodTemplate {
        api_version: pod_yaml.api_version,
        kind: pod_yaml.kind,
        metadata: pod_yaml.metadata,
        spec: ui::Spec {
            containers: pod_yaml.spec.containers
                .into_iter()
                .map(|container| ui::Container {
                    name: container.name,
                    image: container.image,
                    ports: container.ports,
                    template_id: Uuid::new_v4().to_string(),
                })
                .collect(),
        },
    };

    let json= serde_wasm_bindgen::to_value(&pod_json).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(json)
}

#[wasm_bindgen]
pub async fn save(input: JsValue, url: String, csrf: String) -> Result<JsValue, JsValue> {
    let client = reqwest::Client::new();

    let url = format!("{}/{}", url, "v1/pods".to_string());

    let json_value: ui::PodTemplate = serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let namespace = json_value.metadata.namespace.clone();
    let name = json_value.metadata.name.clone();

    let pod = api::PodPayload {
        metadata: api::PodMetadataPayload {
            namespace: json_value.metadata.namespace,
            name: json_value.metadata.name,
            labels: serde_json::json!({
                "workload.user.cattle.io/workloadselector": format!(
                    "pod-{}-{}",
                    namespace,
                    name
                ),
            }),
            annotations: serde_json::json!({}),
        },
        spec: api::PodSpecPayload {
            containers: json_value.spec.containers.into_iter().map(|c| {
                api::PodContainerPayload {
                    name: c.name,
                    image: c.image,
                    imagePullPolicy: "Always".to_string(),
                    volumeMounts: vec![],
                }
            }).collect(),
            initContainers: vec![],
            imagePullSecrets: vec![],
            volumes: vec![],
            affinity: serde_json::json!({}),
        },
    };

    let _response = client.post(&url)
        .header("Accept", "application/json")
        .header("x-api-csrf", &csrf)
        .json(&pod)
        .send()
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(JsValue::UNDEFINED)
}
