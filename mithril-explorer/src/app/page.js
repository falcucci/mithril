"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Col, Form, Row, Stack, Tab, Tabs } from "react-bootstrap";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import CertificatesList from "../components/Artifacts/CertificatesList";
import EpochSettings from "../components/EpochSettings";
import PendingCertificate from "../components/PendingCertificate";
import SnapshotsList from "../components/Artifacts/SnapshotsList";
import MithrilStakeDistributionsList from "../components/Artifacts/MithrilStakeDistributionsList";
import { aggregatorSearchParam } from "../constants";
import { setChartJsDefaults } from "../charts";
import {
  selectAggregator,
  selectedAggregator as currentlySelectedAggregator,
} from "../store/settingsSlice";
import { updatePoolsForAggregator } from "../store/poolsSlice";

// Disable SSR for the following components since they use data from the store that are not
// available server sides (because those data can be read from the local storage).
const AggregatorSetter = dynamic(() => import("../components/AggregatorSetter"), { ssr: false });
const IntervalSetter = dynamic(() => import("../components/IntervalSetter"), {
  ssr: false,
});

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
setChartJsDefaults(Chart);

export default function Explorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // Used to avoid infinite loop between the update of the url query and the navigation handling.
  const [isUpdatingAggregatorInUrl, setIsUpdatingAggregatorInUrl] = useState(false);
  const selectedAggregator = useSelector(currentlySelectedAggregator);

  // Update the aggregator in the url query
  useEffect(() => {
    const aggregatorInUrl = searchParams.get(aggregatorSearchParam);

    if (selectedAggregator !== aggregatorInUrl) {
      const params = new URLSearchParams();
      params.set("aggregator", selectedAggregator);

      setIsUpdatingAggregatorInUrl(true);
      router.push("?" + params.toString(), undefined, { shallow: true });
    }

    dispatch(updatePoolsForAggregator(selectedAggregator));
  }, [selectedAggregator]); // eslint-disable-line react-hooks/exhaustive-deps

  // Allow navigation to work (previous, next)
  useEffect(() => {
    function allowNavigation() {
      if (isUpdatingAggregatorInUrl) {
        setIsUpdatingAggregatorInUrl(false);
      } else {
        const aggregatorInUrl = searchParams.get("aggregator");

        dispatch(selectAggregator(aggregatorInUrl));
      }
    }
    allowNavigation();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack gap={3}>
      <Form>
        <Row xs={1} sm={2} className="row-gap-2">
          <AggregatorSetter />
          <IntervalSetter />
        </Row>
      </Form>
      <Row className="row-gap-3">
        <Col xs={12} sm={4} lg={3} xl={2}>
          <EpochSettings />
        </Col>
        <Col xs={12} sm={8} lg={9} xl={10}>
          <PendingCertificate />
        </Col>
      </Row>
      <Tabs defaultActiveKey="snapshots">
        <Tab title="Snapshots" eventKey="snapshots">
          <SnapshotsList />
        </Tab>
        <Tab title="Mithril Stake Distribution" eventKey="mithrilStakeDistribution">
          <MithrilStakeDistributionsList />
        </Tab>
        {
          <Tab title="Certificates" eventKey="certificates">
            <CertificatesList />
          </Tab>
        }
      </Tabs>
    </Stack>
  );
}
