use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct PodTemplate {
    #[serde(rename = "apiVersion")]
    api_version: String,
    kind: String,
    metadata: Metadata,
    spec: Spec,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct Metadata {
    namespace: String,
    name: String,
    labels: Labels,
    annotations: Annotations
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct Labels {
    app: String,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct Annotations {
    #[serde(rename = "field.cattle.io/description")]
    description: Option<String>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct Spec {
    containers: Vec<Container>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct Container {
    name: String,
    image: String,
    ports: Vec<Port>,
    #[serde(rename = "templateId")]
    template_id: String,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct Port {
    #[serde(rename = "containerPort")]
    container_port: u16,
}

#[derive(Serialize, Deserialize)]
struct PodTemplateYaml {
    #[serde(rename = "apiVersion")]
    api_version: String,
    kind: String,
    metadata: Metadata,
    spec: SpecYaml,
}

#[derive(Serialize, Deserialize)]
struct SpecYaml {
    containers: Vec<ContainerYaml>,
}

#[derive(Serialize, Deserialize)]
struct ContainerYaml {
    name: String,
    image: String,
    ports: Vec<Port>,
}

#[derive(Serialize)]
struct PodPayload {
    metadata: PodMetadataPayload,
    spec: PodSpecPayload,
}

#[derive(Serialize)]
struct PodMetadataPayload {
    namespace: String,
    name: String,
    labels: serde_json::Value,
    annotations: serde_json::Value,
}

#[derive(Serialize)]
struct PodSpecPayload {
    containers: Vec<PodContainerPayload>,
    #[serde(default)]
    initContainers: Vec<serde_json::Value>,
    #[serde(default)]
    imagePullSecrets: Vec<serde_json::Value>,
    #[serde(default)]
    volumes: Vec<serde_json::Value>,
    #[serde(default)]
    affinity: serde_json::Value,
}

#[derive(Serialize)]
struct PodContainerPayload {
    name: String,
    image: String,
    #[serde(default)]
    imagePullPolicy: String,
    #[serde(default)]
    volumeMounts: Vec<serde_json::Value>,
}

impl PodTemplate  {
    fn new() -> PodTemplate {
        PodTemplate {
            api_version: "v1".to_string(),
            kind: "Pod".to_string(),
            metadata: Metadata {
                namespace: "default".to_string(),
                name: "".to_string(),
                labels: Labels {
                    app: "".to_string(),
                },
                annotations: Annotations { description: None },
            },
            spec: Spec {
                containers: vec![Container {
                    name: format!("container-{}", Uuid::new_v4().to_string().split_at(8).0).to_string(),
                    image: "".to_string(),
                    ports: vec![Port {
                        container_port: 80,
                    }],
                    template_id: Uuid::new_v4().to_string(),
                }],
            }
        }
    }
}

#[wasm_bindgen]
pub fn new_pod() -> Result<JsValue, JsValue> {
    Ok(serde_wasm_bindgen::to_value(&PodTemplate::new())?.into())
}

#[wasm_bindgen]
pub fn json_to_yaml(input: JsValue) -> Result<String, JsValue> {
    let json_value: PodTemplate = serde_wasm_bindgen::from_value(input)?;

    let pod_yaml = PodTemplateYaml {
        api_version: json_value.api_version,
        kind: json_value.kind,
        metadata: json_value.metadata,
        spec: SpecYaml {
            containers: json_value.spec.containers
                .into_iter()
                .map(|container| ContainerYaml {
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
    let pod_yaml: PodTemplateYaml = serde_yaml::from_str(input).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let pod_json = PodTemplate {
        api_version: pod_yaml.api_version,
        kind: pod_yaml.kind,
        metadata: pod_yaml.metadata,
        spec: Spec {
            containers: pod_yaml.spec.containers
                .into_iter()
                .map(|container| Container {
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

    let json_value: PodTemplate = serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let namespace = json_value.metadata.namespace.clone();
    let name = json_value.metadata.name.clone();

    let pod = PodPayload {
        metadata: PodMetadataPayload {
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
        spec: PodSpecPayload {
            containers: json_value.spec.containers.into_iter().map(|c| {
                PodContainerPayload {
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
