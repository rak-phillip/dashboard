use serde::{Deserialize, Serialize};
use crate::models::ui;

#[derive(Serialize, Deserialize)]
pub struct PodTemplateYaml {
    #[serde(rename = "apiVersion")]
    pub api_version: String,
    pub kind: String,
    pub metadata: ui::Metadata,
    pub spec: SpecYaml,
}

#[derive(Serialize, Deserialize)]
pub struct SpecYaml {
    pub containers: Vec<ContainerYaml>,
}

#[derive(Serialize, Deserialize)]
pub struct ContainerYaml {
    pub name: String,
    pub image: String,
    pub ports: Vec<ui::Port>,
}
