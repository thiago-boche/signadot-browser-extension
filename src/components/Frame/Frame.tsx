import React, { useEffect } from "react";
import styles from "./Frame.module.css";
import { Switch } from "@blueprintjs/core";
import { RoutingEntity } from "../ListRouteEntries/types";
import ListRouteEntries from "../ListRouteEntries";
import { useFetchRoutingEntries } from "../ListRouteEntries/hooks";
import PinnedRouteGroup from "../PinnedRouteGroup";

const ROUTING_KEY = "routingKey";
const ENABLED = "enabled";

interface StorageChange {
  [key: string]: {
    oldValue?: any;
    newValue?: any;
  };
}

const Frame = () => {
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [debug, setDebug] = React.useState<boolean>(false);

  const [storageValue, setStorageValue] = React.useState<string | undefined>(
    undefined
  );

  const handleEnabledChange = (enable: boolean) => {
    setEnabled(enable);
    chrome.storage.local.set({
      [ENABLED]: enable,
    });
  };

  useEffect(() => {
    chrome.storage.local.get([ROUTING_KEY, ENABLED], (result) => {
      if (ROUTING_KEY in result) {
        setStorageValue(result?.[ROUTING_KEY] || "");
      }
      setEnabled(!!result[ENABLED]);
    });

    const handleStorageChange = (changes: StorageChange, area: string) => {
      if (area === "local" && ROUTING_KEY in changes) {
        setStorageValue(changes[ROUTING_KEY].newValue || "");
      }
    };

    // Add event listener for changes in storage
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup function to remove event listener
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const routingEntities: RoutingEntity[] = useFetchRoutingEntries();
  const [userSelectedEntity, setUserSelectedEntity] = React.useState<
    RoutingEntity | undefined
  >(undefined);
  React.useEffect(() => {
    chrome.storage.local.set({
      [ROUTING_KEY]: userSelectedEntity?.routingKey,
    });
  }, [userSelectedEntity]);
  const pinnedRoutingEntityData: RoutingEntity | undefined =
    React.useMemo(() => {
      const filteredList = routingEntities?.filter(
        (entity) => entity.routingKey === storageValue
      );
      return filteredList?.[0];
    }, [storageValue, routingEntities]);

  return (
    <div>
      <div className={styles.switchPanel}>
        <Switch
          alignIndicator={"right"}
          label={`Setting Routing Key header is ${
            enabled ? "ENABLED" : "DISABLED"
          }`}
          onChange={(e) => handleEnabledChange(e.target.checked)}
          className={styles.switch}
          checked={enabled}
        />
      </div>
      {debug && (
        <div>
          <div>Selected entity: {JSON.stringify(userSelectedEntity)}</div>
          <div>Stored Value: {storageValue}</div>
        </div>
      )}
      {enabled && (
        <div className={styles.content}>
          <ListRouteEntries
            routingEntities={routingEntities}
            setUserSelectedRoutingEntity={setUserSelectedEntity}
          />
          {pinnedRoutingEntityData && (
            <PinnedRouteGroup routingEntity={pinnedRoutingEntityData} />
          )}
        </div>
      )}
    </div>
  );
};

export default Frame;
