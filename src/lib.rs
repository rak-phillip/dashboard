use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;
use serde::Serialize;
use ts_rs::TS;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

#[derive(Serialize, TS)]
#[ts(export)]
struct PodTemplate {
    #[serde(rename = "apiVersion")]
    api_version: String,
    kind: String,
    metadata: Metadata,
    spec: Spec,
}

#[derive(Serialize, TS)]
#[ts(export)]
struct Metadata {
    namespace: String,
    name: String,
    labels: Labels,
    annotations: Annotations
}

#[derive(Serialize, TS)]
#[ts(export)]
struct Labels {
    app: String,
}

#[derive(Serialize, TS)]
#[ts(export)]
struct Annotations {
    #[serde(rename = "field.cattle.io/description")]
    description: Option<String>,
}

#[derive(Serialize, TS)]
#[ts(export)]
struct Spec {
    containers: Vec<Container>,
}

#[derive(Serialize, TS)]
#[ts(export)]
struct Container {
    name: String,
    image: String,
    ports: Vec<Port>,
}

#[derive(Serialize, TS)]
#[ts(export)]
struct Port {
    #[serde(rename = "containerPort")]
    container_port: u16,
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
                    name: "".to_string(),
                    image: "".to_string(),
                    ports: vec![Port {
                        container_port: 80,
                    }]
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
    let json_value = serde_wasm_bindgen::from_value::<serde_json::Value>(input)?;
    let yaml = serde_yaml::to_string(&json_value).map_err(|e| JsValue::from(e.to_string()))?;
    Ok(yaml)
}