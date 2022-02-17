
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Deserialize, Serialize)]
pub struct RoamUser {
    #[serde(rename(deserialize=":user/uid"))]
    pub uid: String,
}

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Deserialize, Serialize)]
pub struct RoamBlockRef {
    #[serde(rename(deserialize=":block/uid"))]
    pub uid: String,
}

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Deserialize, Serialize)]
pub struct RoamRef {
    pub uid: String,
}

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Deserialize, Serialize)]
pub struct RoamBaseNode {
    pub uid: String,
    #[serde(rename(deserialize="edit-time"))]
    pub edit_time: u64,
    #[serde(rename(deserialize="create-time"))]
    pub create_time: Option<u64>,
    #[serde(rename(deserialize=":create/user"))]
    pub user_create: Option<RoamUser>,
    #[serde(rename(deserialize=":edit/user"))]
    pub user_edit: RoamUser,
}

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Deserialize, Serialize)]
pub struct RoamPage {
    #[serde(flatten)]
    pub node: RoamBaseNode,
    pub title: String,
    pub children: Option<Vec<RoamBlock>>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Deserialize, Serialize)]
pub struct RoamBlock {
    #[serde(flatten)]
    pub node: RoamBaseNode,
    pub string: String,
    #[serde(rename(deserialize=":block/refs"))]
    pub block_refs: Option<Vec<RoamBlockRef>>,
    pub refs: Option<Vec<RoamRef>>,
    pub children: Option<Vec<RoamBlock>>,
}
