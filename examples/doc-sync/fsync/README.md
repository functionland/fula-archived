# fsync

A command line interface for sharing updates to files in realtime with anyone.

It watches a plaintext markdown file for changes and invokes the Graph and File APIs when there is a change so that a fuludocs browser client can view the updates.


## Install

```
  > npm install
```

## Run

Execute the `fsync` cmd passing in the path to the file you want to share and get a link with a meeting code to view the file.

```
  > fsync -i /path/to/file -boxid [YOUR_BOX_ID]

Your meeting code is : wfaw-f8qc-fqw1-i2or
```

**@TODO** fetch is not currently implemented

```
  > fsync -o /path/to/output -boxid [YOUR_BOX_ID]
```
