# Verification record

Dataset size: 331 entries, 331 canonical unique URLs.

The dataset was assembled from current chess-resource catalogs and other current source lists used during curation. URL entries that produced an explicit direct web-open failure during this session were removed.

`data/sites.json` records two verification fields for every entry:

- `source`: provenance used to identify the resource.
- `directLiveCheckedInSession`: whether this exact URL returned a live page/redirect in the direct web checks performed during this build session.

This distinction is intentional: the build does not invent HTTP status codes. Because the runtime used to build the artifact has no general-purpose outbound HTTP access outside the web verification tool, not every remaining URL could receive an individual direct live check in this session.

Therefore this artifact is a functional 331-entry build, but it should not be described as a fully completed all-URL-live-verified release until an environment with network access validates every remaining URL.
