import React, { useState } from "react";
import {
  IResourceComponentsProps,
  useShow,
  useParsed,
  useNotification,
} from "@refinedev/core";
import {
  Show,
  NumberField,
  TextField,
  DateField,
  UrlField,
  useTable,
  List,
  EditButton,
  RefreshButton,
  DeleteButton,
} from "@refinedev/antd";
import {
  InsertRowAboveOutlined,
  ScanOutlined,
  CopyOutlined,
  ShareAltOutlined,
  InfoOutlined,
  CheckOutlined,
  SendOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Typography,
  Row,
  Col,
  Table,
  Divider,
  Space,
  Card,
  Button,
  Form,
  Input,
  Select,
  Tag,
} from "antd";
import { SeatManager } from "../../components/modals/seat-manager";
import { IInvitee } from "../../interfaces/invitees";
import _ from "lodash";

const { Title } = Typography;

const TransformMessage = (
  value: string,
  options: { [field: string]: string }
): string => {
  let result = value;
  for (let [k, v] of Object.entries(options)) {
    result = result.replaceAll(`{${k}}`, v);
  }
  return result;
};

export const VhsShow: React.FC<IResourceComponentsProps> = () => {
  const { params } = useParsed();
  const { open } = useNotification();
  const { queryResult } = useShow({
    id: params?.event_id,
  });
  const { data, isLoading } = queryResult;

  const event = data?.data;

  const { tableProps, setFilters, filters } = useTable({
    resource: "invitees",
    filters: {
      permanent: [
        {
          field: "event_id",
          operator: "eq",
          value: event?.id,
        },
      ],
    },
  });

  const [seatModal, setSeatModal] = useState(false);

  const onFilter = (
    column: string,
    operator: string = "contains"
  ): React.ChangeEventHandler => {
    return (e: any) => {
      // @ts-ignore
      setFilters([
        {
          field: column,
          operator,
          value: typeof e !== "object" ? e : e.target.value,
        },
      ]);
    };
  };
  const clearFilter = (field: string) => {
    const index = _.findIndex(filters, ["field", field]);
    filters.splice(index, 1);
    setFilters(filters);
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Show
            isLoading={isLoading}
            recordItemId={params?.event_id}
            headerProps={{
              extra: (
                <Space>
                  <Button
                    target="_blank"
                    href={`/#/station/${params?.event_id}`}
                    type="primary"
                  >
                    <ScanOutlined /> Scan Station
                  </Button>
                  <Button type="default" onClick={() => setSeatModal(true)}>
                    <InsertRowAboveOutlined /> Manage Seats
                  </Button>
                  <Button
                    type="dashed"
                    onClick={() => {
                      const url = `${import.meta.env.VITE_BASE_URL}/#/summary/${
                        event?.shorturi
                      }`;
                      navigator.clipboard.writeText(url);
                      open?.({
                        type: "success",
                        message: "Summary URL copied to clipboard!",
                      });
                    }}
                  >
                    <CopyOutlined /> Summary URL
                  </Button>
                  <Divider type="vertical" />
                  <EditButton
                    resource="events"
                    recordItemId={params?.event_id}
                  />
                  <DeleteButton
                    resource="events"
                    recordItemId={params?.event_id}
                  />
                  <RefreshButton
                    resource="events"
                    recordItemId={params?.event_id}
                  />
                </Space>
              ),
            }}
          >
            <Row>
              <Col span={12}>
                <Title level={5}>Id</Title>
                <NumberField value={event?.id ?? ""} />
                <Title level={5}>Name</Title>
                <TextField value={event?.name} />
                <Title level={5}>Total Seats</Title>
                <NumberField value={event?.total_seats ?? ""} />
                <Title level={5}>Date</Title>
                <DateField value={event?.date} />
                <Title level={5}>Time</Title>
                <DateField format="hh:mm A" value={event?.time} />
              </Col>
              <Col>
                <Title level={5}>Message</Title>
                <TextField value={event?.message} />
                <Title level={5}>Invitation Link</Title>
                <TextField
                  value={<UrlField value={event?.invitation_link} />}
                />
                <Title level={5}>Created At</Title>
                <DateField value={event?.created_at} />
                <Title level={5}>Updated At</Title>
                <DateField value={event?.updated_at} />
                <Title level={5}>Created By</Title>
                <TextField value={event?.created_by?.name} />
              </Col>
            </Row>
          </Show>
        </Col>
        <Divider />
        <Col span={24}>
          <List
            resource="invitees"
            breadcrumb=""
            createButtonProps={{
              children: "Add Invitee",
              meta: { event_id: event?.id },
            }}
          >
            <Row gutter={[10, 10]}>
              <Col span={6}>
                <Card title="Filter">
                  <Form layout="vertical">
                    <Form.Item label="Name">
                      <Input placeholder="Name" onChange={onFilter("name")} />
                    </Form.Item>
                    <Form.Item label="Phone Number">
                      <Input
                        placeholder="Phone Number"
                        onChange={onFilter("phone")}
                      />
                    </Form.Item>
                    <Form.Item label="Status">
                      <Select
                        placeholder="Status"
                        onChange={onFilter("status", "eq")}
                        onClear={() => clearFilter("status")}
                        allowClear
                      >
                        <Select.Option value="sent">Sent</Select.Option>
                        <Select.Option value="read">Read</Select.Option>
                        <Select.Option value="accepted">Accepted</Select.Option>
                        <Select.Option value="declined">Declined</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Priority Level">
                      <Select
                        placeholder="Priority"
                        onChange={onFilter("priority", "eq")}
                        onClear={() => clearFilter("priority")}
                        allowClear
                      >
                        <Select.Option value={false}>Reguler</Select.Option>
                        <Select.Option value={true}>VIP</Select.Option>
                      </Select>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col span={18}>
                <Table {...tableProps} rowKey="id">
                  <Table.Column
                    dataIndex="qr"
                    title="QR"
                    render={(v) => <img src={v} width={50} />}
                  />
                  <Table.Column dataIndex="name" title="Name" />
                  <Table.Column dataIndex="total_person" title="Total Person" />
                  <Table.Column dataIndex="phone" title="Phone Number" />
                  <Table.Column
                    dataIndex="status"
                    title="Status"
                    render={(v: "sent" | "read" | "accepted" | "declined") => {
                      const colorMap = {
                        sent: "default",
                        read: "blue",
                        accepted: "green",
                        declined: "red",
                      };
                      const iconMap = {
                        sent: <SendOutlined />,
                        read: <InfoOutlined />,
                        accepted: <CheckOutlined />,
                        declined: <CloseOutlined />,
                      };
                      return (
                        <Tag color={colorMap[v]}>
                          {iconMap[v]} {v.toUpperCase()}
                        </Tag>
                      );
                    }}
                  />
                  <Table.Column
                    dataIndex="arrived_at"
                    title="Arrived At"
                    render={(v) =>
                      v ? <DateField value={v} format="hh:mm A" /> : "-"
                    }
                  />
                  <Table.Column
                    dataIndex="priority"
                    title="Priority"
                    render={(v) => (v ? "Yes" : "No")}
                  />
                  <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, r: IInvitee) => (
                      <Space>
                        <Button
                          icon={<CopyOutlined />}
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(r.invitation_link!);
                            open?.({
                              type: "success",
                              message: "Invitation link copied to clipboard!",
                            });
                          }}
                        />
                        <Button
                          icon={<ShareAltOutlined />}
                          size="small"
                          onClick={() => {
                            navigator.share({
                              text: TransformMessage(event?.message, {
                                id: r.id!,
                                url: TransformMessage(event?.invitation_link, {
                                  id: r.id!,
                                }),
                                name: encodeURIComponent(r.name),
                              }),
                            });
                          }}
                        />
                        <EditButton
                          resource="invitees"
                          hideText
                          size="small"
                          meta={{ event_id: event?.id }}
                          recordItemId={r.id}
                        />
                        <DeleteButton
                          resource="invitees"
                          hideText
                          size="small"
                          recordItemId={r.id}
                        />
                      </Space>
                    )}
                  />
                </Table>
              </Col>
            </Row>
          </List>
        </Col>
      </Row>
      <SeatManager
        title="Manage Seat"
        centered
        open={seatModal}
        onOk={() => setSeatModal(false)}
        onCancel={() => setSeatModal(false)}
        width={1000}
        event_id={params?.event_id}
        max_seat={event?.total_seats}
      />
    </>
  );
};
