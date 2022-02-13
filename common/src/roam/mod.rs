
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct RoamUser {
    #[serde(rename = ":user/uid")]
    pub uid: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoamBlockRef {
    #[serde(rename = ":block/uid")]
    pub uid: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoamRef {
    pub uid: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoamBaseNode {
    pub uid: String,
    #[serde(rename = "edit-time")]
    pub edit_time: u64,
    #[serde(rename = "create-time")]
    pub create_time: Option<u64>,
    #[serde(rename = ":create/user")]
    pub user_create: Option<RoamUser>,
    #[serde(rename = ":edit/user")]
    pub user_edit: RoamUser,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoamPage {
    #[serde(flatten)]
    pub node: RoamBaseNode,
    pub title: String,
    pub children: Option<Vec<RoamBlock>>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoamBlock {
    #[serde(flatten)]
    pub node: RoamBaseNode,
    pub string: String,
    #[serde(rename = ":block/refs")]
    pub block_refs: Option<Vec<RoamBlockRef>>,
    pub refs: Option<Vec<RoamRef>>,
    pub children: Option<Vec<RoamBlock>>,
}
