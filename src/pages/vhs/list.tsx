import React, { useState, useEffect } from "react";
import { IResourceComponentsProps, BaseRecord, useGetIdentity } from "@refinedev/core";
import {
    useTable,
    List,
    EditButton,
    ShowButton,
    DeleteButton,
    UrlField,
    TagField,
    DateField
} from "@refinedev/antd";
import { InboxOutlined, DownloadOutlined, UploadOutlined, DashboardOutlined } from '@ant-design/icons';
import { Table, Space, Row, Col, Card, Input, Form, Select, DatePicker, Slider, Divider } from "antd";
import _ from 'lodash';
import { Upload, Button } from 'antd';
import { RcFile } from "antd/es/upload";
import { Application } from "@feathersjs/feathers";
import csv_export from 'json-to-csv-export';
import csv from 'csvtojson';

export const VhsList = ({ client }: { client: Application }) => {
    const [itemsToUpload, setItemsToUpload] = useState<any[]>([]);
    const [isDownloadLoading, setDownloadLoading] = useState(false);
    const [isImportLoading, setImportLoading] = useState(false);
    const { data: user } = useGetIdentity<{ id: number; supplier_name: string; supplier_site: string; type: string }>();
    const { tableProps, setFilters, filters } = useTable({
        syncWithLocation: true,
        filters: user?.supplier_name ? {
            permanent: [{ field: 'supplier_name', operator: 'eq', value: user?.supplier_name }, { field: 'organization', operator: 'eq', value: user?.supplier_site }],
        } : undefined,
        sorters: {
            permanent: [{ field: 'site', order: 'asc' }, { field: 'item_number', order: 'asc' }]
        }
    });

    useEffect(() => { console.log(user) }, []);

    const onFilter = (column: string): React.ChangeEventHandler => {
        return (e) => {
            // @ts-ignore
            setFilters([{ field: column, operator: 'contains', value: typeof e === "string" ? e : e.target.value }])
        }
    }

    const clearFilter = (field: string) => {
        const index = _.findIndex(filters, ['field', field]);
        filters.splice(index, 1);
        setFilters(filters);
    }

    const prepareFile = async (file: RcFile) => {
        const csvString = await file.text();
        const items = await csv().fromString(csvString);
        setItemsToUpload(items.map((it) => ({
            ...it,
            supplier_id: user?.id, supplier_name: user?.supplier_name ? user?.supplier_name : it.supplier_name, organization: user?.supplier_site ? user?.supplier_site : it.organization, is_vendor: user?.type == 'Vendor'
        })));
        // const existingItems = await client.service('items').find({
        //     query: { $limit: 1000, item_number: { $in: items.map((d) => d.item_number) } }
        // });
        return false;
    }
    const downloadTemplate = async () => {
        setDownloadLoading(true);
        const items = await client.service('vhs').find({ query: { $limit: 1000, supplier_name: user?.supplier_name ? user?.supplier_name : undefined, organization: user?.supplier_site ? user?.supplier_site : undefined } });
        csv_export({
            data: items.data.map((d: any) => ({
                site: d.site,
                organization: d.organization,
                item_number: d.item_number,
                description: d.description,
                category: d.category,
                min: d.min,
                max: d.max,
                soh: d.soh,
                uom: d.uom,
                supplier_name: d.supplier_name
            })), filename: 'vhs-export.csv'
        });
        setDownloadLoading(false);
    }
    const importTemplate = async () => {
        setImportLoading(true);
        const api = import.meta.env.VITE_API_URL;
        try {
            const rawRes = await fetch(`${api}/upload_vhs`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemsToUpload)
            });
            const uploadRes = await rawRes.json();
            console.log(uploadRes);
        } catch (e: any) { alert(e.message) }
        setImportLoading(false);
        // window.location.reload();
    }

    return (
        <List>
            <Row gutter={[10, 10]}>
                <Col span={6}>
                    <Button type="primary" onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}/#/dashboard_vhs`)} icon={<DashboardOutlined />} size="middle">VHS Dashboard</Button>
                    <Divider />
                    <Card title="Mass Upload">
                        <Upload.Dragger maxCount={1} beforeUpload={prepareFile} multiple={false}>
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Klik atau drag file template upload</p>
                        </Upload.Dragger><br />
                        <Button type="primary" onClick={importTemplate} loading={isImportLoading} disabled={itemsToUpload.length == 0} icon={<UploadOutlined />} size="middle">Import</Button>
                        <Divider type="vertical" />
                        <Button type="default" onClick={downloadTemplate} loading={isDownloadLoading} icon={<DownloadOutlined />} size="middle">Download Template</Button>
                    </Card>
                    <br />
                    <Card title="Filter">
                        <Form layout="vertical">
                            <Form.Item label="Item Number">
                                <Input placeholder="Item Number" onChange={onFilter('item_number')} />
                            </Form.Item>
                            <Form.Item label="Site">
                                <Input placeholder="Site" onChange={onFilter('site')} />
                            </Form.Item>
                            <Form.Item label="Organization">
                                <Input placeholder="Organization" onChange={onFilter('organization')} />
                            </Form.Item>
                            {/* <Form.Item label="Date">
                                <DatePicker.RangePicker style={{ width: '100%' }} onChange={(v) => {
                                    // @ts-ignore
                                    if (v) setFilters([{ field: 'date', operator: 'and', value: [{ $gte: v[0]?.format('YYYY-MM-DD') }, { $lte: v[1]?.format('YYYY-MM-DD') }] }])
                                    else clearFilter('date')
                                }} />
                            </Form.Item> */}
                            {/* <Form.Item label="Total Person">
                                <Slider tooltip={{ open: true, placement: 'right' }} onAfterChange={(v) => setFilters([{ field: 'total_seats', operator: 'eq', value: v }])}/>
                            </Form.Item> */}
                        </Form>
                    </Card>
                </Col>
                <Col span={18}>
                    <Table {...tableProps} rowKey="id">
                        <Table.Column dataIndex="id" title="Id" />
                        <Table.Column dataIndex="site" title="Name" />
                        <Table.Column dataIndex="organization" title="Organization" />
                        <Table.Column dataIndex="supplier_name" title="Supplier" />
                        <Table.Column dataIndex="item_number" title="Item Number" />
                        <Table.Column dataIndex="category" title="Category" />
                        <Table.Column dataIndex="soh" title="SOH" />
                        <Table.Column dataIndex="min" title="Min" />
                        <Table.Column dataIndex="max" title="Max" />
                        <Table.Column dataIndex="uom" title="UoM" />
                        <Table.Column dataIndex="remark" title="Remark" />
                        <Table.Column
                            dataIndex={["created_at"]}
                            title="Created At"
                            render={(value: any) => <DateField value={value} format="MMMM Do YYYY" />}
                        />
                        {/* <Table.Column
                            dataIndex={["created_by", "name"]}
                            title="Created By"
                        /> */}
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