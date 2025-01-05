import React, { useEffect } from "react";
import { IResourceComponentsProps, BaseRecord, useParsed } from "@refinedev/core";
import {
    useTable,
    List,
    EditButton,
    ShowButton,
    DeleteButton,
    TagField,
    EmailField,
    DateField,
} from "@refinedev/antd";
import { Table, Space, Row, Col, Card, Input, Form, Select } from "antd";

export const UserList: React.FC<IResourceComponentsProps> = () => {
    const { params } = useParsed();
    const { tableProps, setFilters } = useTable({
        syncWithLocation: true
    });

    const onFilter = (column: string): React.ChangeEventHandler => {
        return (e) => {
            // @ts-ignore
            setFilters([{ field: column, operator: 'contains', value: typeof e === "string" ? e : e.target.value }])
        }
    }

    return (
        <List>
            <Row gutter={[10, 10]}>
                <Col span={6}>
                    <Card title="Filter">
                        <Form layout="vertical">
                            <Form.Item label="Name">
                                <Input placeholder="Name" onChange={onFilter('name')}/>
                            </Form.Item>
                            <Form.Item label="Username">
                                <Input placeholder="Username" onChange={onFilter('username')} />
                            </Form.Item>
                            <Form.Item label="Type">
                                <Select
                                    placeholder="Type"
                                    onChange={onFilter('type')}
                                    onClear={() => setFilters([{ field: 'type', operator: 'contains', value: '' }])}
                                    allowClear
                                    >
                                    <Select.Option value="Administrator">Administrator</Select.Option>
                                    <Select.Option value="Vendor">Vendor</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col span={18}>
                    <Table {...tableProps} rowKey="id">
                        <Table.Column dataIndex="id" title="Id" />
                        <Table.Column dataIndex="name" title="Name" />
                        <Table.Column
                            dataIndex={["username"]}
                            title="Username"
                            render={(value: any) => <EmailField value={value} />}
                        />
                        <Table.Column dataIndex="type" title="Type" render={(type) => type === 'Administrator' ? 'Administrator' : 'Vendor'} />
                        <Table.Column
                            dataIndex={["created_at"]}
                            title="Created At"
                            render={(value: any) => <DateField value={value} />}
                        />
                        <Table.Column
                            dataIndex={["updated_at"]}
                            title="Updated At"
                            render={(value: any) => <DateField value={value} />}
                        />
                        <Table.Column
                            title="Actions"
                            dataIndex="actions"
                            render={(_, record: BaseRecord) => (
                                <Space>
                                    <EditButton
                                        hideText
                                        size="small"
                                        recordItemId={record.id}
                                    />
                                    <ShowButton
                                        hideText
                                        size="small"
                                        recordItemId={record.id}
                                    />
                                    <DeleteButton
                                        hideText
                                        size="small"
                                        recordItemId={record.id}
                                    />
                                </Space>
                            )}
                        />
                    </Table>
                </Col>
            </Row>
        </List>
    );
};
