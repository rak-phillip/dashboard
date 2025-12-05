use serde::{Deserialize, Serialize};
use crate::models::pod::Port;
use crate::models::ui;

#[derive(Serialize)]
pub struct PodPayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(rename = "apiVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
    pub metadata: PodMetadataPayload,
    pub spec: PodSpecPayload,
}

#[derive(Serialize)]
pub struct PodMetadataPayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<Vec<serde_json::Value>>,
    pub namespace: String,
    pub name: String,
    pub labels: serde_json::Value,
    pub annotations: serde_json::Value,
    #[serde(rename = "resourceVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resource_version: Option<String>,
}

#[derive(Serialize)]
pub struct PodSpecPayload {
    pub containers: Vec<PodContainerPayload>,
    #[serde(default)]
    pub initContainers: Vec<serde_json::Value>,
    #[serde(default)]
    pub imagePullSecrets: Vec<serde_json::Value>,
    #[serde(default)]
    pub volumes: Vec<serde_json::Value>,
    #[serde(default)]
    pub affinity: serde_json::Value,
    #[serde(rename = "dnsPolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dns_policy: Option<String>,
    #[serde(rename = "enableServiceLinks")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_service_links: Option<bool>,
    #[serde(rename = "nodeName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub node_name: Option<String>,
    #[serde(rename = "preemptionPolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preemption_policy: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub priority: Option<i64>,
    #[serde(rename = "restartPolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub restart_policy: Option<String>,
    #[serde(rename = "schedulerName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scheduler_name: Option<String>,
    #[serde(rename = "securityContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub security_context: Option<serde_json::Value>,
    #[serde(rename = "serviceAccount")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub service_account: Option<String>,
    #[serde(rename = "serviceAccountName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub service_account_name: Option<String>,
    #[serde(rename = "terminationGracePeriodSeconds")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_grace_period_seconds: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tolerations: Option<Vec<serde_json::Value>>,
}

#[derive(Serialize)]
pub struct PodContainerPayload {
    #[serde(default)]
    #[serde(rename = "imagePullPolicy")]
    pub image_pull_policy: String,
    pub name: String,
    #[serde(default)]
    #[serde(rename = "volumeMounts")]
    pub volume_mounts: Vec<serde_json::Value>,
    pub image: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resources: Option<serde_json::Value>,
    #[serde(rename = "terminationMessagePath")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_message_path: Option<String>,
    #[serde(rename = "terminationMessagePolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_message_policy: Option<String>,
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ports: Option<Vec<Port>>,
}

#[derive(Serialize, Deserialize)]
pub struct PodResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub links: serde_json::Value,
    #[serde(rename = "apiVersion")]
    pub api_version: String,
    pub kind: String,
    pub metadata: PodMetadataResponse,
    pub spec: PodSpecResponse,
    pub status: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
pub struct PodMetadataResponse {
    #[serde(rename = "creationTimestamp")]
    pub creation_timestamp: String,
    pub fields: Vec<serde_json::Value>,
    pub generation: i64,
    pub labels: std::collections::HashMap<String, String>,
    #[serde(rename = "managedFields")]
    pub managed_fields: Vec<serde_json::Value>,
    pub name: String,
    pub namespace: String,
    pub relationships: Vec<serde_json::Value>,
    #[serde(rename = "resourceVersion")]
    pub resource_version: String,
    pub state: serde_json::Value,
    pub uid: String,
    #[serde(default)]
    pub annotations: ui::Annotations,
}

#[derive(Serialize, Deserialize)]
pub struct PodSpecResponse {
    pub affinity: serde_json::Value,
    pub containers: Vec<PodContainerResponse>,
    #[serde(rename = "dnsPolicy")]
    pub dns_policy: String,
    #[serde(rename = "enableServiceLinks")]
    pub enable_service_links: bool,
    #[serde(rename = "nodeName")]
    pub node_name: String,
    #[serde(rename = "preemptionPolicy")]
    pub preemption_policy: String,
    pub priority: i64,
    #[serde(rename = "restartPolicy")]
    pub restart_policy: String,
    #[serde(rename = "schedulerName")]
    pub scheduler_name: String,
    #[serde(rename = "securityContext")]
    pub security_context: serde_json::Value,
    #[serde(rename = "serviceAccount")]
    pub service_account: String,
    #[serde(rename = "serviceAccountName")]
    pub service_account_name: String,
    #[serde(rename = "terminationGracePeriodSeconds")]
    pub termination_grace_period_seconds: i64,
    pub tolerations: Vec<serde_json::Value>,
    pub volumes: Vec<serde_json::Value>,
    #[serde(rename = "imagePullSecrets")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_pull_secrets: Option<Vec<serde_json::Value>>,
    #[serde(rename = "initContainers")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub init_containers: Option<Vec<serde_json::Value>>,
}

#[derive(Serialize, Deserialize)]
pub struct PodContainerResponse {
    pub image: String,
    #[serde(rename = "imagePullPolicy")]
    pub image_pull_policy: String,
    pub name: String,
    pub resources: serde_json::Value,
    #[serde(rename = "terminationMessagePath")]
    pub termination_message_path: String,
    #[serde(rename = "terminationMessagePolicy")]
    pub termination_message_policy: String,
    #[serde(rename = "volumeMounts")]
    pub volume_mounts: Vec<serde_json::Value>,
    #[serde(default)]
    pub ports: Vec<PortResponse>,
}

#[derive(Serialize, Deserialize)]
pub struct PortResponse {
    #[serde(rename = "containerPort")]
    pub container_port: u16,
}
