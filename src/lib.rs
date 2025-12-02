use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;
use serde::Serialize;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

#[derive(Serialize)]
struct PodTemplate {
    #[serde(rename = "apiVersion")]
    api_version: String,
    kind: String,
    metadata: Metadata,
    spec: Spec,
}

#[derive(Serialize)]
struct Metadata {
    name: String,
    labels: Labels,
}

#[derive(Serialize)]
struct Labels {
    app: String,
}

#[derive(Serialize)]
struct Spec {
    containers: Vec<Container>,
}

#[derive(Serialize)]
struct Container {
    name: String,
    image: String,
    ports: Vec<Port>,
}

#[derive(Serialize)]
struct Port {
    #[serde(rename = "containerPort")]
    container_port: u16,
}

#[wasm_bindgen]
pub fn new_pod() -> Result<JsValue, JsValue> {
    let template = PodTemplate {
        api_version: "v1".to_string(),
        kind: "Pod".to_string(),
        metadata: Metadata {
            name: "<pod-name>".to_string(),
            labels: Labels {
                app: "<app-name>".to_string(),
            }
        },
        spec: Spec {
            containers: vec![Container {
                name: "<container-name>".to_string(),
                image: "<image-name".to_string(),
                ports: vec![Port {
                    container_port: 80,
                }]
            }],
        }
    };

    Ok(serde_wasm_bindgen::to_value(&template)?)
}
