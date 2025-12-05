mod models;

use serde_json::json;
use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;
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
        id: None,
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
                    image_pull_policy: None,
                    resources: None,
                    termination_message_path: None,
                    termination_message_policy: None,
                    volume_mounts: vec![],
                })
                .collect(),
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
            volumes: vec![],
            image_pull_secrets: vec![],
            init_containers: vec![],
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

    let pod_json = ui::PodTemplate {
        id: Some(pod_response.id),
        api_version: pod_response.api_version,
        kind: pod_response.kind,
        metadata: ui::Metadata {
            namespace: pod_response.metadata.namespace,
            name: pod_response.metadata.name,
            labels: ui::Labels {
                app: pod_response.metadata.labels
                    .get("workload.user.cattle.io/workloadselector")
                    .cloned()
                    .unwrap_or_default(),
            },
            annotations: pod_response.metadata.annotations,
            resource_version: Some(pod_response.metadata.resource_version),
            fields: Some(pod_response.metadata.fields),
        },
        spec: ui::Spec {
            containers: pod_response
                .spec
                .containers
                .into_iter()
                .map(|container| ui::Container {
                    name: container.name,
                    image: container.image,
                    template_id: Uuid::new_v4().to_string(),
                    ports: container
                        .ports
                        .into_iter()
                        .map(|port| ui::Port {
                            container_port: port.container_port,
                        })
                        .collect(),
                    image_pull_policy: Some(container.image_pull_policy),
                    resources: Some(container.resources),
                    termination_message_path: Some(container.termination_message_path),
                    termination_message_policy: Some(container.termination_message_policy),
                    volume_mounts: container.volume_mounts,
                })
                .collect(),
            affinity: Some(pod_response.spec.affinity).unwrap_or_default(),
            dns_policy: Some(pod_response.spec.dns_policy),
            enable_service_links: Some(pod_response.spec.enable_service_links),
            node_name: Some(pod_response.spec.node_name),
            preemption_policy: Some(pod_response.spec.preemption_policy),
            priority: Some(pod_response.spec.priority),
            restart_policy: Some(pod_response.spec.restart_policy),
            scheduler_name: Some(pod_response.spec.scheduler_name),
            security_context: Some(pod_response.spec.security_context),
            service_account: Some(pod_response.spec.service_account),
            service_account_name: Some(pod_response.spec.service_account_name),
            termination_grace_period_seconds: Some(pod_response.spec.termination_grace_period_seconds),
            tolerations: Some(pod_response.spec.tolerations),
            volumes: Some(pod_response.spec.volumes).unwrap_or_default(),
            image_pull_secrets: pod_response.spec.image_pull_secrets.unwrap_or_default(),
            init_containers: pod_response.spec.init_containers.unwrap_or_default(),
        },
    };

    let json = serde_wasm_bindgen::to_value(&pod_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(json)
}

#[wasm_bindgen]
pub async fn update(input: JsValue, url: String, namespace: String, name: String, csrf: String) -> Result<JsValue, JsValue> {
    let pod_template: ui::PodTemplate = serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let pod = api::PodPayload {
        id: pod_template.id,
        api_version: Some(pod_template.api_version),
        kind: Some(pod_template.kind),
        metadata: api::PodMetadataPayload {
            namespace: pod_template.metadata.namespace,
            name: pod_template.metadata.name,
            labels: serde_json::to_value(pod_template.metadata.labels).unwrap_or_default(),
            annotations: serde_json::to_value(pod_template.metadata.annotations).unwrap_or_default(),
            resource_version: pod_template.metadata.resource_version,
            fields: pod_template.metadata.fields,
        },
        spec: api::PodSpecPayload {
            containers: pod_template.spec.containers.into_iter().map(|c| {
                api::PodContainerPayload {
                    name: c.name,
                    image: c.image,
                    image_pull_policy: c.image_pull_policy.unwrap_or_default(),
                    volume_mounts: c.volume_mounts,
                    resources: c.resources,
                    termination_message_path: c.termination_message_path,
                    termination_message_policy: c.termination_message_policy,
                    ports: Some(c.ports),
                }
            }).collect(),
            initContainers: pod_template.spec.init_containers,
            imagePullSecrets: pod_template.spec.image_pull_secrets,
            volumes: pod_template.spec.volumes,
            affinity: pod_template.spec.affinity,
            dns_policy: pod_template.spec.dns_policy,
            enable_service_links: pod_template.spec.enable_service_links,
            node_name: pod_template.spec.node_name,
            preemption_policy: pod_template.spec.preemption_policy,
            priority: pod_template.spec.priority,
            restart_policy: pod_template.spec.restart_policy,
            scheduler_name: pod_template.spec.scheduler_name,
            security_context: pod_template.spec.security_context,
            service_account: pod_template.spec.service_account,
            service_account_name: pod_template.spec.service_account_name,
            termination_grace_period_seconds: pod_template.spec.termination_grace_period_seconds,
            tolerations: pod_template.spec.tolerations,
        },
    };

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

    let pod_json = ui::PodTemplate {
        id: Some(pod_response.id),
        api_version: pod_response.api_version,
        kind: pod_response.kind,
        metadata: ui::Metadata {
            namespace: pod_response.metadata.namespace,
            name: pod_response.metadata.name,
            labels: ui::Labels {
                app: pod_response.metadata.labels
                    .get("workload.user.cattle.io/workloadselector")
                    .cloned()
                    .unwrap_or_default(),
            },
            annotations: pod_response.metadata.annotations,
            resource_version: Some(pod_response.metadata.resource_version),
            fields: Some(pod_response.metadata.fields),
        },
        spec: ui::Spec {
            containers: pod_response
                .spec
                .containers
                .into_iter()
                .map(|container| ui::Container {
                    name: container.name,
                    image: container.image,
                    template_id: Uuid::new_v4().to_string(),
                    ports: container
                        .ports
                        .into_iter()
                        .map(|port| ui::Port {
                            container_port: port.container_port,
                        })
                        .collect(),
                    image_pull_policy: Some(container.image_pull_policy),
                    resources: Some(container.resources),
                    termination_message_path: Some(container.termination_message_path),
                    termination_message_policy: Some(container.termination_message_policy),
                    volume_mounts: container.volume_mounts,
                })
                .collect(),
            affinity: pod_response.spec.affinity,
            dns_policy: Some(pod_response.spec.dns_policy),
            enable_service_links: Some(pod_response.spec.enable_service_links),
            node_name: Some(pod_response.spec.node_name),
            preemption_policy: Some(pod_response.spec.preemption_policy),
            priority: Some(pod_response.spec.priority),
            restart_policy: Some(pod_response.spec.restart_policy),
            scheduler_name: Some(pod_response.spec.scheduler_name),
            security_context: Some(pod_response.spec.security_context),
            service_account: Some(pod_response.spec.service_account),
            service_account_name:  Some(pod_response.spec.service_account_name),
            termination_grace_period_seconds: Some(pod_response.spec.termination_grace_period_seconds),
            tolerations: Some(pod_response.spec.tolerations),
            volumes: pod_response.spec.volumes,
            image_pull_secrets: pod_response.spec.image_pull_secrets.unwrap_or_default(),
            init_containers: pod_response.spec.init_containers.unwrap_or_default(),
        },
    };

    let json = serde_wasm_bindgen::to_value(&pod_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(json)
}
