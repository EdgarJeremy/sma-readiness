import {
  useList,
  useNotification,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Skeleton,
  Divider,
  Button,
  Space,
  Alert,
  Empty,
  Popover,
  Spin,
  Select,
  List,
  Input,
  InputNumber,
} from "antd";
import { ISeat } from "../../interfaces/seats";
import { IEvent } from "../../interfaces/events";
import { DateField, NumberField, TextField } from "@refinedev/antd";

import {
  SaveOutlined,
  ScanOutlined,
  CheckCircleFilled,
  QrcodeOutlined,
  OrderedListOutlined,
  ReloadOutlined,
  CheckOutlined,
  PrinterOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import Draggable, { DraggableEventHandler } from "react-draggable";
import _ from "lodash";
import { useReactToPrint } from "react-to-print";
import { SeatCanvas } from "../../seat-canvas";

// @ts-ignore
import scanJs from "onscan.js";

// @ts-ignore
import addDashes from "add-dashes-to-uuid";

import { OnResultFunction, QrReader } from "react-qr-reader";
import { IInvitee } from "../../interfaces/invitees";
import { Application } from "@feathersjs/feathers";
import { InviteeChooser } from "../../components/modals/invitee-chooser";
import { InviteeAdd } from "../../components/modals/invitee-add";

const Title = Typography.Title;

export const ItemStation = ({ client }: { client: Application }) => {
  const { open: notify, close } = useNotification();
  const { params } = useParsed();
  const { queryResult } = useShow<IEvent>({
    resource: "events",
    id: params?.event_id,
  });
  const { data, isLoading: eventLoading } = queryResult;
  const event = data?.data;

  const {
    data: existingSeats,
    isLoading: seatLoading,
    refetch: refetchSeats,
  } = useList<ISeat>({
    resource: "seats",
    filters: [
      {
        field: "event_id",
        operator: "eq",
        value: params?.event_id,
      },
    ],
    pagination: {
      pageSize: 1000,
    },
    sorters: [{ field: "number", order: "asc" }],
  });
  const seats = existingSeats?.data;
  const [person, setPerson] = useState<number>(0);

  const [inviteeChooserModal, setInviteeChooserModal] = useState(false);
  const [inviteeAddModal, setInviteeAddModal] = useState(false);

  const [mode, setMode] = useState<
    "scan" | "info" | "seat" | "person" | "print"
  >("scan");
  const [scanned, setScanned] = useState<string | null>(null);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [invitee, setInvitee] = useState<IInvitee | null>(null);
  const [inviteeLoading, setInviteeLoading] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<ISeat[]>([]);

  const [seatCanvas, setSeatCanvas] = useState<SeatCanvas | null>(null);

  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [chairs, setChairs] = useState<fabric.Group[]>([]);

  const [seatToPrint, setSeatToPrint] = useState<ISeat | null>(null);
  const [printMode, setPrintMode] = useState<"seat" | "invitation">(
    "invitation"
  );
  const receiptRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  // @ts-ignore
  const getScanned = () => document.scanned;
  const isSeatSelected = (id: number) =>
    selectedSeats.filter((s) => s.id == id).length > 0;

  useEffect(() => {
    document.body.style.backgroundColor = "#ecf0f1";
    if (!scanJs.isAttachedTo(document)) {
      scanJs.attachTo(document, {
        onScan: (code: any) => onScan({ text: code }),
      });
    }
  }, []);

  useEffect(() => {
    if (!eventLoading) {
      document.title = event?.name!;
      const welcomeWindow = window.open(
        `${import.meta.env.VITE_BASE_URL}/#/welcome/${params?.event_id}`,
        "_blank"
      );
      // @ts-ignore
      window.welcomeWindow = welcomeWindow;
    }
  }, [eventLoading]);

  useEffect(() => {
    if (!seatLoading && mode === "seat") {
      const sc = new SeatCanvas("canvas");
      setSeatCanvas(sc);
      drawSeats(seats!, sc);
      sc.setUnselectable();
    }
  }, [seatLoading, mode]);

  useEffect(() => {
    for (let i = 0; i < chairs.length; i++) {
      const chair = chairs[i];
      chair.off("mousedown");
      chair.on("mousedown", (e) => {
        const seat = _.find(seats, ["id", e.target?.data.id]);
        onSeatClicked(seat!, chair);
      });
    }
  }, [selectedSeats, chairs]);

  useEffect(() => {
    if (invitee) {
      // @ts-ignore
      if (window.welcomeWindow) window.welcomeWindow.updateInvitee(invitee);
    }
  }, [invitee]);

  const drawSeats = (seats: ISeat[], sc: SeatCanvas) => {
    const chairs = [];
    for (let i = 0; i < seats.length; i++) {
      const chair = sc.addChair(
        {
          angle: seats[i].angle,
          top: seats[i].top,
          left: seats[i].left,
          width: seats[i].width,
          height: seats[i].height,
          scale_x: seats[i].scale_x,
          scale_y: seats[i].scale_y,
          data: { id: seats[i].id, number: seats[i].number.toString() },
        },
        false,
        !!seats[i].invitee_id
      );
      chairs.push(chair);
    }
    setChairs([...chairs]);
  };

  const onSeatClicked = (seat: ISeat, chair: fabric.Group) => {
    if (invitee && !seat.invitee_id) {
      const rect = chair.getObjects("rect")[0];
      // Select/unselect seat
      if (isSeatSelected(seat.id!)) {
        const filtered = selectedSeats.filter((s) => s.id !== seat.id);
        setSelectedSeats([...filtered]);
        rect.set("fill", seatCanvas?.chairFill);
      } else {
        setSelectedSeats([...selectedSeats, seat]);
        rect.set("fill", seatCanvas?.chairActiveFill);
      }
    } else {
      // Invitee info (if occupied)
    }
  };

  const onScan = async (result: any) => {
    if (result && !getScanned()) {
      setMode("info");
      setScanTime(new Date());
      setScanned(addDashes(result.text));
      setInviteeLoading(true);
      // @ts-ignore
      document.scanned = true;
      try {
        const invitee = await client.service("invitees").get(result.text);
        setInviteeLoading(false);
        setInvitee(invitee);
      } catch (e) {
        setScanned(null);
        setInviteeLoading(false);
        setMode("scan");
      }
    }
  };

  const clear = () => {
    // @ts-ignore
    document.scanned = false;
    setScanTime(null);
    setScanned(null);
    setInvitee(null);
    setInviteeLoading(false);
    setSelectedSeats([]);
    setMode("scan");
    // @ts-ignore
    if (window.welcomeWindow) window.welcomeWindow.updateInvitee(null);
  };

  const onSave = async () => {
    if (invitee) {
      setSaveLoading(true);
      const result = [
        client
          .service("invitees")
          .patch(invitee.id!, { arrived_at: scanTime, total_person: person }),
        // ...selectedSeats.map((s) =>
        // client.service("seats").patch(s.id!, { invitee_id: invitee.id })
        // ),
      ];
      try {
        await Promise.all(result);
        notify!({
          type: "success",
          message:
            "Invitee has been assign seat and successfuly saved to database",
        });
        const { data: existingSeats } = await refetchSeats();
        const seats = existingSeats?.data;
        console.log("refetch", seats);
        setMode("print");
      } catch (e: any) {
        notify!({
          type: "error",
          message: `Error while saving data: ${e.message}`,
        });
      }
      setPerson(0);
      setSaveLoading(false);
    }
  };

  return eventLoading && seatLoading ? (
    <div className="full-container">
      <Spin size="large" />
    </div>
  ) : (
    <>
      <div
        style={{
          backgroundImage:
            mode !== "info"
              ? `url(${import.meta.env.VITE_API_URL}/event_images/${
                  params?.event_id
                }/summary_image)`
              : `url(${import.meta.env.VITE_API_URL}/event_images/${
                  params?.event_id
                }/station_image)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          position: "fixed",
          inset: 0,
          zIndex: -2,
          opacity: 0.25,
        }}
      ></div>
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <Title level={2} style={{ margin: 0, color: "black" }}>
          {event?.name}
        </Title>
        <Title
          level={4}
          style={{
            fontWeight: "lighter",
            margin: 0,
            marginBottom: 20,
            color: "black",
          }}
        >
          {mode === "scan"
            ? "Scan your QR found in the invitation to proceed"
            : ""}
          {mode === "info" ? "Confirm your invitee data below" : ""}
          {mode === "person" ? "Set person" : ""}
        </Title>
      </div>
      <div className="full-container">
        {mode === "scan" && (
          <>
            <div style={{ textAlign: "center", color: "black" }}>
              <Title level={4} style={{ fontWeight: "normal", color: "black" }}>
                Scan invitation's QR Code to scanner
              </Title>
              <Divider>or</Divider>
              <Space>
                <Button
                  type="default"
                  icon={<OrderedListOutlined />}
                  size="large"
                  onClick={() => setInviteeChooserModal(true)}
                >
                  Choose from Invitee List
                </Button>
              </Space>
              <Divider>or</Divider>
              <Space>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => setInviteeAddModal(true)}
                >
                  Add new Invitee
                </Button>
              </Space>
            </div>
          </>
        )}
        {mode === "info" && (
          <div className="full-container" onClick={() => setMode("person")}>
            <div>
              {scanned ? (
                !inviteeLoading ? (
                  <>
                    <Row
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Title
                        level={4}
                        style={{
                          fontWeight: "lighter",
                          margin: 0,
                          color: "black",
                        }}
                      >
                        Welcome!
                      </Title>
                      <Title level={2} style={{ margin: 0, color: "black" }}>
                        {invitee?.name}
                      </Title>
                      {invitee?.priority && (
                        <Title
                          level={2}
                          style={{ margin: 0, color: "#b39700" }}
                        >
                          V I P
                        </Title>
                      )}
                      <Col span={24}>
                        <Space
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          {/* <Button size="large" onClick={() => setMode('seat')}><CheckOutlined /> Confirm</Button> */}
                        </Space>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Skeleton active paragraph={true} />
                )
              ) : (
                <Empty
                  style={{ justifySelf: "center", alignSelf: "center" }}
                  description="Scan invitation's QR code to show invitee data"
                />
              )}
            </div>
          </div>
        )}
        {mode === "person" && (
          <>
            <div>
              {selectedSeats.length ? (
                <Alert
                  onClick={handlePrint}
                  message={`${selectedSeats.length} seat${
                    selectedSeats.length > 1 ? "s" : ""
                  } selected. Click save to proceed.`}
                  type="success"
                  showIcon
                />
              ) : (
                <Alert message="Input current person" showIcon />
              )}
            </div>
            <div
              style={{
                position: "relative",
                height: 400,
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <Row>
                <Col>
                  <Button
                    size="large"
                    onClick={(e) => setPerson((p) => (p -= 1))}
                  >
                    <MinusOutlined />
                  </Button>
                </Col>
                <Col>
                  <InputNumber
                    size="large"
                    value={person || null}
                    onChange={(e) => setPerson(e || 0)}
                  />
                </Col>
                <Col>
                  <Button
                    size="large"
                    onClick={(e) => setPerson((p) => (p += 1))}
                  >
                    <PlusOutlined />
                  </Button>
                </Col>
              </Row>
            </div>
            <div>
              <Space>
                <Button
                  style={{ position: "fixed", top: 10, right: 10 }}
                  type="default"
                  disabled={person < 1}
                  onClick={() => onSave()}
                  loading={saveLoading}
                  size="large"
                >
                  <PrinterOutlined /> Save
                </Button>
              </Space>
            </div>
          </>
        )}
        {mode === "print" && (
          <>
            <div style={{ textAlign: "center" }}>
              <Button
                size="large"
                onClick={() => {
                  setPrintMode("invitation");
                  notify!({
                    type: "success",
                    message: "Added receipt to print...",
                    key: "notify",
                  });
                  setTimeout(() => {
                    handlePrint();
                    close!("notify");
                  }, 1000);
                }}
              >
                <PrinterOutlined /> Print Invitation
              </Button>
            </div>
            <div>
              <Space>
                <Button
                  style={{ position: "fixed", top: 10, right: 10 }}
                  type="default"
                  onClick={clear}
                  size="large"
                >
                  <SaveOutlined /> Done
                </Button>
              </Space>
            </div>
          </>
        )}

        {["scan", "print"].indexOf(mode) === -1 && (
          <Button
            style={{ position: "fixed", top: 10, left: 10 }}
            type="primary"
            danger
            onClick={clear}
            size="large"
          >
            <ScanOutlined /> Re-scan
          </Button>
        )}
      </div>
      {mode === "scan" && (
        <>
          <InviteeChooser
            event_id={event?.id!}
            open={inviteeChooserModal}
            centered
            title="Choose from registered invitee"
            width={1000}
            onCancel={() => setInviteeChooserModal(false)}
            onChooseInvitee={(invitee) => {
              setScanTime(new Date());
              setInvitee(invitee);
              setInviteeLoading(false);
              setScanned(invitee.id!);
              setMode("info");
              // @ts-ignore
              document.scanned = true;
            }}
          />
          <InviteeAdd
            event_id={event?.id!}
            open={inviteeAddModal}
            centered
            title="Choose from registered invitee"
            width={1000}
            onCancel={() => setInviteeAddModal(false)}
            onSubmit={(invitee) => {
              setScanTime(new Date());
              setInvitee(invitee);
              setInviteeLoading(false);
              setScanned(invitee.id!);
              setMode("info");
              setInviteeAddModal(false);
              // @ts-ignore
              document.scanned = true;
            }}
          />
        </>
      )}
      <div style={{ display: "none" }}>
        {invitee && (
          <Receipt
            ref={receiptRef}
            seat={seatToPrint}
            mode={printMode}
            invitee={invitee}
          />
        )}
      </div>
    </>
  );
};

interface ReceiptProps {
  seat: ISeat | null;
  invitee: IInvitee | null;
  mode: "seat" | "invitation";
}

export const Receipt = React.forwardRef((props: ReceiptProps, ref) => {
  const { invitee, seat, mode } = props;
  return (
    // @ts-ignore
    <div ref={ref}>
      {mode === "seat" ? (
        <div className="receipt">
          <div>Your seat number</div>
          <h1>#{seat?.number}</h1>
        </div>
      ) : (
        <div className="receipt">
          <h1>{invitee?.name}</h1>
        </div>
      )}
    </div>
  );
});
