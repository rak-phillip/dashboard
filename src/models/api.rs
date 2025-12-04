use serde::Serialize;

#[derive(Serialize)]
pub struct PodPayload {
    pub metadata: PodMetadataPayload,
    pub spec: PodSpecPayload,
}

#[derive(Serialize)]
pub struct PodMetadataPayload {
    pub namespace: String,
    pub name: String,
    pub labels: serde_json::Value,
    pub annotations: serde_json::Value,
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
}

#[derive(Serialize)]
pub struct PodContainerPayload {
    pub name: String,
    pub image: String,
    #[serde(default)]
    pub imagePullPolicy: String,
    #[serde(default)]
    pub volumeMounts: Vec<serde_json::Value>,
}
