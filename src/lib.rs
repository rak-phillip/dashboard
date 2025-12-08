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
pub fn yaml_to_json(current: JsValue, input: &str) -> Result<JsValue, JsValue> {
    let mut pod: ui::PodTemplate = serde_wasm_bindgen::from_value(current)?;
    let pod_yaml: yaml::PodTemplateYaml = serde_yaml::from_str(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    pod.apply_yaml_patch(pod_yaml);
    let json= serde_wasm_bindgen::to_value(&pod).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(json)
}

#[wasm_bindgen]
pub async fn save(input: JsValue, url: String, csrf: String) -> Result<JsValue, JsValue> {
    let client = reqwest::Client::new();

    let url = format!("{}/{}", url, "v1/pods".to_string());

    let mut json_value: ui::PodTemplate = serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    json_value.metadata.labels.workload_selector = format!(
        "pod-{}-{}",
        json_value.metadata.namespace,
        json_value.metadata.name,
    ).into();

    let pod: api::PodPayload = json_value.into();

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
