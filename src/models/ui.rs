use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PodTemplate {
    #[serde(rename = "apiVersion")]
    pub api_version: String,
    pub kind: String,
    pub metadata: Metadata,
    pub spec: Spec,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Metadata {
    pub namespace: String,
    pub name: String,
    pub labels: Labels,
    pub annotations: Annotations
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
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Spec {
    pub containers: Vec<Container>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Container {
    pub name: String,
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
