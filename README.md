A utility for managing content in a file between markers.

```js
import { createMarker } from "string-marker";
import { writeFile } from "node:fs/promises";
const file = new URL("file.txt", import.meta.url);
await writeFile(file, "");

// file (url or string path), start tag, end tag, separator (optional)
const marker = createMarker(file, "# begin", "# end", "\n");

// creates the marker, does not error if marker already exists
await marker.create();

// creates the marker, and clears the content if one already exists
await marker.create(true);

// update the content between the markers, also accepts a single string
await marker.update(["some", "things"]);

// file =
// # begin
// some
// things
// # end

// remove the marker and all contents between
await marker.remove();
```

If the markers are malformed (present start and missing end, present end and missing start, start after end) an error will be thrown and no changes will be made to avoid possibly making the issue worse.
