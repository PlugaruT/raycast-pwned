import { Detail, showToast, ToastStyle, List, ActionPanel, OpenInBrowserAction, Icon, Color } from "@raycast/api";
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


  return <List isLoading={!props.hashes} throttle={true} onSearchTextChange={(text) => {
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
      }).catch(error => {
        showToast(ToastStyle.Failure, `Error: ${error.message}`);
      });
  }}>
    {props.hashes?.map((hash) => (
      <List.Item
        title={hash.suffix}
        key={hash.suffix}
        icon={{ source: hash.match ? Icon.XmarkCircle : Icon.Circle, tintColor: hash.match ? Color.Red : Color.SecondaryText }}
        accessoryTitle={hash.match ? `Password is compromised. There are ${hash.count} appearances` : ""}
        actions={
          <ActionPanel title="Actions">
            <OpenInBrowserAction url="https://haveibeenpwned.com" />
          </ActionPanel>
        } />
    ))}
  </List>;
}

