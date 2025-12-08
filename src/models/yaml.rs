use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

#[derive(Serialize, Deserialize)]
pub struct PodTemplateYaml {
    #[serde(rename = "apiVersion")]
    pub api_version: String,
    pub kind: String,
    pub metadata: MetadataYaml,
    pub spec: SpecYaml,
}

#[derive(Serialize, Deserialize)]
pub struct MetadataYaml {
    pub name: String,
    pub namespace: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub annotations: Option<std::collections::HashMap<String, String>>,
    #[serde(rename = "creationTimestamp")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub creation_timestamp: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub generation: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub labels: Option<std::collections::HashMap<String, String>>,
    #[serde(rename = "managedFields")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub managed_fields: Option<Vec<JsonValue>>,
    #[serde(rename = "resourceVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resource_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uid: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<Vec<JsonValue>>,
}

#[derive(Serialize, Deserialize)]
pub struct SpecYaml {
    pub containers: Vec<ContainerYaml>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub affinity: Option<JsonValue>,
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
    pub security_context: Option<JsonValue>,
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
    pub tolerations: Option<Vec<JsonValue>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub volumes: Option<Vec<JsonValue>>,
    #[serde(rename = "imagePullSecrets")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_pull_secrets: Option<Vec<JsonValue>>,
    #[serde(rename = "initContainers")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub init_containers: Option<Vec<JsonValue>>,
}

#[derive(Serialize, Deserialize)]
pub struct ContainerYaml {
    pub name: String,
    pub image: String,
    #[serde(rename = "imagePullPolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_pull_policy: Option<String>,
    pub ports: Vec<PortYaml>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resources: Option<JsonValue>,
    #[serde(rename = "terminationMessagePath")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_message_path: Option<String>,
    #[serde(rename = "terminationMessagePolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_message_policy: Option<String>,
    #[serde(rename = "volumeMounts")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub volume_mounts: Option<Vec<JsonValue>>,
}

#[derive(Serialize, Deserialize)]
pub struct PortYaml {
    #[serde(rename = "containerPort")]
    pub container_port: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub protocol: Option<String>,
}
