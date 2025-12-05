use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PodTemplate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(rename = "apiVersion")]
    pub api_version: String,
    pub kind: String,
    pub metadata: Metadata,
    pub spec: Spec,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Metadata {
    #[ts(type = "(any | undefined)[]")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<Vec<serde_json::Value>>,
    pub namespace: String,
    pub name: String,
    pub labels: Labels,
    pub annotations: Annotations,
    #[serde(rename = "resourceVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resource_version: Option<String>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Labels {
    pub app: String,
}

#[derive(Serialize, Deserialize, Default, TS)]
#[ts(export)]
pub struct Annotations {
    #[serde(rename = "field.cattle.io/description")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Spec {
    #[ts(type = "any")]
    pub affinity: serde_json::Value,
    pub containers: Vec<Container>,
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
    #[ts(type = "any")]
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
    #[ts(type = "any[]")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tolerations: Option<Vec<serde_json::Value>>,
    #[ts(type = "any[]")]
    pub volumes: Vec<serde_json::Value>,
    #[serde(rename = "imagePullSecrets")]
    #[ts(type = "any[]")]
    pub image_pull_secrets: Vec<serde_json::Value>,
    #[serde(rename = "initContainers")]
    #[ts(type = "any[]")]
    pub init_containers: Vec<serde_json::Value>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Container {
    pub name: String,
    #[serde(rename = "imagePullPolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_pull_policy: Option<String>,
    #[ts(type = "any")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resources: Option<serde_json::Value>,
    #[serde(rename = "terminationMessagePath")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_message_path: Option<String>,
    #[serde(rename = "terminationMessagePolicy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub termination_message_policy: Option<String>,
    #[serde(rename = "volumeMounts")]
    #[ts(type = "any[]")]
    pub volume_mounts: Vec<serde_json::Value>,
    pub image: String,
    pub ports: Vec<Port>,
    #[serde(rename = "templateId")]
    pub template_id: String,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Port {
    #[serde(rename = "containerPort")]
    pub container_port: u16,
}

impl PodTemplate  {
    pub fn new() -> PodTemplate {
        PodTemplate {
            id: None,
            api_version: "v1".to_string(),
            kind: "Pod".to_string(),
            metadata: Metadata {
                namespace: "default".to_string(),
                name: "".to_string(),
                labels: Labels {
                    app: "".to_string(),
                },
                annotations: Annotations { description: None },
                resource_version: None,
                fields: None,
            },
            spec: Spec {
                containers: vec![Container {
                    name: format!("container-{}", Uuid::new_v4().to_string().split_at(8).0).to_string(),
                    image: "".to_string(),
                    ports: vec![Port {
                        container_port: 80,
                    }],
                    template_id: Uuid::new_v4().to_string(),
                    volume_mounts: vec![],
                    image_pull_policy: None,
                    resources: None,
                    termination_message_path: None,
                    termination_message_policy: None,
                }],
                affinity: serde_json::json!({}),
                dns_policy: None,
                enable_service_links: None,
                node_name : None,
                init_containers: vec![],
                image_pull_secrets: vec![],
                volumes: vec![],
                preemption_policy: None,
                priority: None,
                restart_policy: None,
                scheduler_name: None,
                security_context: None,
                service_account: None,
                service_account_name: None,
                termination_grace_period_seconds: None,
                tolerations: None,
            }
        }
    }
}
