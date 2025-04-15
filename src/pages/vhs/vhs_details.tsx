import { Application } from "@feathersjs/feathers/lib"
import { useParsed, useShow } from "@refinedev/core"
import { IEvent } from "../../interfaces/events";
import { Row, Spin, Typography, Col, Card, Statistic, Progress, Divider, DatePicker, Button } from "antd";
import { useEffect, useState } from "react";
import { IInvitee } from "../../interfaces/invitees";
import { FallOutlined, LineOutlined, RiseOutlined, CloseCircleOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import moment from "moment";
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import csv_export from 'json-to-csv-export';
import csv from 'csvtojson';
import logo from '../../sma-full.png';
import { sanitizeNumber } from "../../utils";
import _ from 'lodash';

const Title = Typography.Title;


function orgToSite(org: string) {
    switch (org) {
        case 'C0021W1':
            return 'BAKAN';
        case 'C0019W1':
            return 'TANJUNG BULI';
        case 'C0013W1':
            return 'GAG';
        case 'C0022W1':
            return 'PANI';
        case 'C0004W1':
            return 'TOKA';
        case 'C0015W1':
            return 'WEDA W1';
        case 'C0015W2':
            return 'WEDA W2';
    }
}

function InfoTile({ records, org, type, backgroundColor }: { records: any[], org: string, type: string, backgroundColor?: string }) {
    return (
        <div style={{ display: 'flex', flex: 1, marginBottom: 5 }}>
            <div style={{ display: 'flex', flex: 1, borderColor: '#222222', borderWidth: 1, borderStyle: 'solid', padding: 5, fontWeight: 'bold', backgroundColor, fontSize: 20 }}>{type}</div>
            <div style={{ display: 'flex', flex: 2, borderColor: '#222222', borderWidth: 1, borderStyle: 'solid', padding: 5, borderLeft: 0, fontSize: 20 }}>{records.filter((r) => r.organization == org && r.remark == type.toUpperCase()).length}</div>
        </div>
    )
}

export function VhsDetails({ records, snapshots, site, range, setRange, reset }: { records: any[], snapshots: any[], site: string, range: dayjs.Dayjs[], setRange: React.Dispatch<React.SetStateAction<dayjs.Dayjs[]>>, reset: any }) {

    const vRecords = _.groupBy(records.filter((r) => r.organization == site), 'supplier_name');

    return (
        <div style={{ textAlign: 'center', paddingTop: 50, color: "black" }}>
            <div style={{ display: 'flex', marginBottom: 50 }}>
                <div style={{ flex: 1 }}>
                    <img src={logo} style={{ width: 150, height: 150 }} className="responsive-image" />
                </div>
                <div style={{ flex: 6, alignSelf: 'center' }}>
                    <Title level={2} style={{ margin: 0, color: "black" }}>{orgToSite(site)} VHS STOCK</Title>
                    <Title level={4} style={{ fontWeight: 'lighter', margin: 0, color: "black" }}>
                        SMA {orgToSite(site)} VHS Readiness Dashboard</Title>
                </div>
                <div style={{ flex: 1, alignSelf: 'center' }}>
                    <Button size="large" onClick={() => reset()}><ArrowLeftOutlined /> Back</Button>
                </div>
            </div>
            <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                <div className="supplier_container">
                    {Object.keys(vRecords).map((sup, i) => (
                        <Card key={i} title={sup} className="supplier_card" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                            <Row gutter={[5, 15]}>
                                {/* <Col lg={12}><Statistic title="Over" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'OVER').length} valueStyle={{ fontSize: 20, color: '#2ecc71' }} prefix={<RiseOutlined />} /></Col>
                <Col lg={12}><Statistic title="Balance" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'BALANCE').length} valueStyle={{ fontSize: 20, color: '#3498db' }} prefix={<LineOutlined />} /></Col>
                <Col lg={12}><Statistic title="Short" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'SHORT').length} valueStyle={{ fontSize: 20, color: '#f39c12' }} prefix={<FallOutlined />} /></Col>
                <Col lg={12}><Statistic title="Empty" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'EMPTY').length} valueStyle={{ fontSize: 20, color: '#e74c3c' }} prefix={<CloseCircleOutlined />} /></Col> */}
                                <div style={{ flex: 1 }}>
                                    <InfoTile records={vRecords[sup]} org={site} type="Over" backgroundColor="#2ecc71" />
                                    <InfoTile records={vRecords[sup]} org={site} type="Balance" backgroundColor="#2ecc71" />
                                    <InfoTile records={vRecords[sup]} org={site} type="Short" backgroundColor="#f1c40f" />
                                    <InfoTile records={vRecords[sup]} org={site} type="Empty" backgroundColor="#e74c3c" />
                                </div>
                            </Row>
                            <br />
                            {/* <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0021W1')}>Download</Button> */}
                        </Card>
                    ))}
                </div>
                <Divider />
                <h1 style={{ marginBottom: 20 }}>Exclude Short</h1>
                <div className="supplier_container">
                    {Object.keys(vRecords).map((sup, i) => (
                        <div className="supplier_card" key={i}>
                            <h2>{sup}</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((vRecords[sup].filter((r) => r.organization == site && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / vRecords[sup].filter((r) => r.organization == site).length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </div>
                    ))}
                </div>
                <Divider />
                {/* include short  */}
                <h1 style={{ marginBottom: 20 }}>Include Short</h1>
                <div className="supplier_container">
                    {Object.keys(vRecords).map((sup, i) => (
                        <div className="supplier_card" key={i}>
                            <h2>{sup}</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((vRecords[sup].filter((r) => r.organization == site && ['OVER', 'BALANCE', 'SHORT'].indexOf(r.remark) != -1).length / vRecords[sup].filter((r) => r.organization == site).length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </div>
                    ))}
                </div>
                <Divider />
                <div style={{ textAlign: 'left' }}>
                    <h3>Date Range</h3>
                    {/* @ts-ignore */}
                    <DatePicker.RangePicker onChange={(v) => setRange(v)} defaultValue={range} />
                </div>
                <Divider />
                <Row gutter={[10, 10]}>
                    <Col lg={4} xs={24}>
                        <h2>Bakan</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0021W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                    <Col lg={3} xs={24}>
                        <h2>Tanjung Buli</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0019W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                    <Col lg={3} xs={24}>
                        <h2>GAG</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0013W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                    <Col lg={3} xs={24}>
                        <h2>Pani</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0022W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                    <Col lg={3} xs={24}>
                        <h2>Toka</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0004W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                    <Col lg={4} xs={24}>
                        <h2>Weda W1</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0015W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                    <Col lg={4} xs={24}>
                        <h2>Weda W2</h2>
                        <Line data={snapshots.filter((r) => r.organization == 'C0015W2').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                    </Col>
                </Row>
                <Divider />
                {/* <Row gutter={[10, 10]}>
                            <Col lg={24} xs={24}>
                                <h2>Bakan</h2>
                                <Line data={snapshots.filter((r) => r.organization == 'C0021W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                            </Col>
                            <Col lg={24} xs={24}>
                                <h2>Tanjung Buli</h2>
                                <Line data={snapshots.filter((r) => r.organization == 'C0019W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                            </Col>
                            <Col lg={24} xs={24}>
                                <h2>GAG</h2>
                                <Line data={snapshots.filter((r) => r.organization == 'C0013W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                            </Col>
                            <Col lg={24} xs={24}>
                                <h2>Pani</h2>
                                <Line data={snapshots.filter((r) => r.organization == 'C0022W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                            </Col>
                            <Col lg={24} xs={24}>
                                <h2>Toka</h2>
                                <Line data={snapshots.filter((r) => r.organization == 'C0004W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                            </Col>
                            <Col lg={24} xs={24}>
                                <h2>Weda</h2>
                                <Line data={snapshots.filter((r) => r.organization == 'C0015W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                            </Col>
                        </Row> */}
            </div>
        </div >
    )
}