import { Detail, showToast, ToastStyle, List } from "@raycast/api";
import axios from "axios";
import { useState } from "react";
import crypto from "crypto";

interface Hash {
  suffix: string;
  count: number;
  match: boolean;
}


interface Props {
  hashes?: Hash[];
}

function sha1(str: string) {
  return crypto
    .createHash("sha1")
    .update(str)
    .digest("hex");
}

export default function Command() {
  const [props, setProps] = useState<Props>({});


  return <List isLoading={!props.hashes} onSearchTextChange={(text) => {
    const passwordHash = sha1(text).toUpperCase();
    const passwordPrefix = passwordHash.substring(0, 5).toUpperCase();
    const passwordSuffix = passwordHash.substring(5).toUpperCase();

    axios.get(`https://api.pwnedpasswords.com/range/${passwordPrefix}`)
      .then(res => {
        var hashes: Hash[] = [];

        res.data.split("\r\n").map((line: string) => {
          const hash = {
            suffix: line.split(":")[0],
            count: parseInt(line.split(":")[1]),
            match: passwordSuffix === line.split(":")[0]
          };
          if (hash.match) {
            hashes.splice(0, 0, hash);
          } else {
            hashes.push(hash);
          }
        });
        setProps({ hashes: hashes });
      });
  }}>
    {props.hashes?.map((hash) => (
      <List.Item title={hash.suffix + " " + hash.count} key={hash.suffix} subtitle={hash.match ? "match" : "not match"} />
    ))}
  </List>;
}

