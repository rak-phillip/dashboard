mod models;
mod conversions;

use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;
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
    let pod_yaml: yaml::PodTemplateYaml = json_value.into();
    let yaml = serde_yaml::to_string(&pod_yaml).map_err(|e| JsValue::from(e.to_string()))?;
    Ok(yaml)
}

#[wasm_bindgen]
pub fn yaml_to_json(input: &str) -> Result<JsValue, JsValue> {
    let pod_yaml: yaml::PodTemplateYaml = serde_yaml::from_str(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let pod_json: ui::PodTemplate = pod_yaml.into();
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
        id: None,
        api_version: None,
        kind: None,
        metadata: api::PodMetadataPayload {
            fields: None,
            namespace: json_value.metadata.namespace,
            name: json_value.metadata.name,
            labels: serde_json::json!({
                "workload.user.cattle.io/workloadselector": format!(
                    "pod-{}-{}",
                    namespace,
                    name
                ),
            }),
            annotations: serde_json::from_value(serde_json::to_value(json_value.metadata.annotations).unwrap_or_default()).unwrap(),
            resource_version: None,
        },
        spec: api::PodSpecPayload {
            containers: json_value.spec.containers.into_iter().map(|c| {
                api::PodContainerPayload {
                    name: c.name,
                    image: c.image,
                    image_pull_policy: "Always".to_string(),
                    volume_mounts: vec![],
                    resources: None,
                    termination_message_path: None,
                    termination_message_policy: None,
                    ports: None,
                }
            }).collect(),
            initContainers: vec![],
            imagePullSecrets: vec![],
            volumes: vec![],
            affinity: serde_json::json!({}),
            dns_policy: None,
            enable_service_links: None,
            node_name: None,
            preemption_policy: None,
            priority: None,
            restart_policy: None,
            scheduler_name: None,
            security_context: None,
            service_account: None,
            service_account_name: None,
            termination_grace_period_seconds: None,
            tolerations: None,
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

#[wasm_bindgen]
pub async fn get(url: String, namespace: String, name: String, csrf: String) -> Result<JsValue, JsValue> {
    let client = reqwest::Client::new();
    let url = format!("{}/v1/pods/{}/{}", url, namespace, name);

    let response = client
        .get(&url)
        .header("Accept", "application/json")
        .header("x-api-csrf", &csrf)
        .send()
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let text = response.text().await.map_err(|e| JsValue::from_str(&e.to_string()))?;

    web_sys::console::log_1(&text.clone().into());

    let pod_response: api::PodResponse =
        serde_json::from_str(&text).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let pod_json: ui::PodTemplate = pod_response.into();

    let json = serde_wasm_bindgen::to_value(&pod_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(json)
}

#[wasm_bindgen]
pub async fn update(input: JsValue, url: String, namespace: String, name: String, csrf: String) -> Result<JsValue, JsValue> {
    let pod_template: ui::PodTemplate = serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let pod: api::PodPayload = pod_template.into();

    let client = reqwest::Client::new();
    let url = format!("{}/v1/pods/{}/{}", url, namespace, name);
    let response = client.put(&url)
        .header("Accept", "application/json")
        .header("x-api-csrf", &csrf)
        .json(&pod)
        .send()
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let text = response.text().await.map_err(|e| JsValue::from_str(&e.to_string()))?;

    let pod_response: api::PodResponse =
        serde_json::from_str(&text).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let pod_json: ui::PodTemplate = pod_response.into();
    let json = serde_wasm_bindgen::to_value(&pod_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(json)
}
