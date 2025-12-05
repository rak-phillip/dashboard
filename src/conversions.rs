use uuid::Uuid;
use crate::models::ui::PodTemplate;
use crate::models::{api, ui, yaml};
use crate::models::api::{PodPayload, PodResponse};
use crate::models::yaml::PodTemplateYaml;

impl From<PodTemplate> for PodTemplateYaml {
    fn from(pod_template: PodTemplate) -> Self {
        PodTemplateYaml {
            api_version: pod_template.api_version,
            kind: pod_template.kind,
            metadata: pod_template.metadata,
            spec: yaml::SpecYaml {
                containers: pod_template.spec.containers
                    .into_iter()
                    .map(|container| yaml::ContainerYaml {
                        name: container.name,
                        image: container.image,
                        ports: container.ports,
                    })
                    .collect(),
            },
        }
    }
}

impl From<PodTemplateYaml> for PodTemplate {
    fn from(pod_template_yaml: PodTemplateYaml) -> Self {
        PodTemplate {
            id: None,
            api_version: pod_template_yaml.api_version,
            kind: pod_template_yaml.kind,
            metadata: pod_template_yaml.metadata,
            spec: ui::Spec {
                containers: pod_template_yaml.spec.containers
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
        }
    }
}

impl From<PodResponse> for PodTemplate {
    fn from(pod_response: PodResponse) -> Self {
        PodTemplate {
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
        }
    }
}

impl From<PodTemplate> for PodPayload {
    fn from(pod_template: PodTemplate) -> Self {
        PodPayload {
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
        }
    }
}
