#!/bin/bash
cd .source/ONET/db_30_0_text
for file in *.txt; do
  base=$(echo "$file" | sed 's/\.txt$//')
  target="../ONET.${base}.tsv"
  if [ ! -f "$target" ]; then
    echo "Converting: $file -> ONET.${base}.tsv"
    cp "$file" "$target"
  fi
done
cd ..
echo "Total TSV files: $(ls -1 ONET.*.tsv | wc -l)"
