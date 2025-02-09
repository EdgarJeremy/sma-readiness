import { Application } from "@feathersjs/feathers/lib"
import { useParsed, useShow } from "@refinedev/core"
import { IEvent } from "../../interfaces/events";
import { Row, Spin, Typography, Col, Card, Statistic, Progress, Divider, DatePicker, Button } from "antd";
import { useEffect, useState } from "react";
import { IInvitee } from "../../interfaces/invitees";
import { FallOutlined, LineOutlined, RiseOutlined, CloseCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import moment from "moment";
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import csv_export from 'json-to-csv-export';
import csv from 'csvtojson';
import logo from '../../sma-full.png';
import { sanitizeNumber } from "../../utils";

const Title = Typography.Title;

export const DashboardOwn = ({ client }: { client: Application }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [snapshots, setSnapshots] = useState<any[]>([]);
    const [range, setRange] = useState([dayjs().startOf('month'), dayjs()]);

    useEffect(() => {
        document.body.style.background = "linear-gradient(to right, hsl(227, 50%, 75%), hsl(90, 50%, 85%), hsl(0, 50%, 90%))";
        document.body.style.height = "100vh"; // Ensure the gradient covers the full viewport height
        document.body.style.margin = "0"; // Remove default margin for consistent background
        client.service('items').find({ query: { $limit: 20000 } }).then((res) => {
            console.log(res.data);
            setRecords(res.data);
            client.service('snapshots').find({ query: { $limit: 20000, $sort: { date: 1 } } }).then((res2) => {
                setSnapshots(res2.data);
                setIsLoading(false);
            }).catch((e) => { console.log(e) });
        }).catch((e) => { console.log(e) });
    }, []);

    useEffect(() => {
        client.service('snapshots').find({ query: { $limit: 20000, date: { $gte: range[0].format('YYYY-MM-DD'), $lte: range[1].format('YYYY-MM-DD') } } }).then((res) => {
            setSnapshots(res.data);
        }).catch((e) => console.log(e));
    }, [range]);

    const exportItems = async (organization: string) => {
        const items = await client.service('items').find({ query: { $limit: 1000, organization } });
        const site = items.data[0].site;
        csv_export({
            data: items.data.map((d: any) => ({
                site: d.site,
                organization: d.organization,
                item_number: d.item_number,
                description: d.description,
                uom: d.uom,
                category: d.category,
                min: d.min,
                max: d.max,
                soh: d.soh,
                remark: d.remark
            })), filename: `${site}.csv`
        });
    }

    return isLoading ? (<div className='full-container'><Spin size="large" /></div>) : (
        <>
            <div style={{ textAlign: 'center', paddingTop: 50, color: "black" }}>
                <div style={{ display: 'flex', marginBottom: 50 }}>
                    <div style={{ flex: 1 }}>
                        <img src={logo} style={{ width: 150, height: 150 }} className="responsive-image" />
                    </div>
                    <div style={{ flex: 6, alignSelf: 'center' }}>
                        <Title level={2} style={{ margin: 0, color: "black" }}>READINESS OWN STOCK</Title>
                        <Title level={4} style={{ fontWeight: 'lighter', margin: 0, color: "black" }}>
                            SMA Own Inventory Readiness Dashboard</Title>
                    </div>
                    <div style={{ flex: 1 }}>

                    </div>
                </div>
                <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                    <Row gutter={[10, 10]}>
                        <Col lg={4} xs={24}>
                            <Card title="BAKN" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                                <Row gutter={[5, 15]}>
                                    {/* <Col lg={12}><Statistic title="Over" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'OVER').length} valueStyle={{ fontSize: 20, color: '#2ecc71' }} prefix={<RiseOutlined />} /></Col>
                                    <Col lg={12}><Statistic title="Balance" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'BALANCE').length} valueStyle={{ fontSize: 20, color: '#3498db' }} prefix={<LineOutlined />} /></Col>
                                    <Col lg={12}><Statistic title="Short" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'SHORT').length} valueStyle={{ fontSize: 20, color: '#f39c12' }} prefix={<FallOutlined />} /></Col>
                                    <Col lg={12}><Statistic title="Empty" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'EMPTY').length} valueStyle={{ fontSize: 20, color: '#e74c3c' }} prefix={<CloseCircleOutlined />} /></Col> */}
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0021W1" type="Over" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0021W1" type="Balance" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0021W1" type="Short" backgroundColor="#f1c40f" />
                                        <InfoTile records={records} org="C0021W1" type="Empty" backgroundColor="#e74c3c" />
                                    </div>
                                </Row>
                                <br />
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0021W1')}>Download</Button>
                            </Card>
                        </Col>
                        <Col lg={4} xs={24}>
                            <Card title="BULI" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0019W1" type="Over" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0019W1" type="Balance" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0019W1" type="Short" backgroundColor="#f1c40f" />
                                        <InfoTile records={records} org="C0019W1" type="Empty" backgroundColor="#e74c3c" />
                                    </div>
                                </Row>
                                <br />
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0019W1')}>Download</Button>
                            </Card>
                        </Col>
                        <Col lg={4} xs={24}>
                            <Card title="GAGN" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0013W1" type="Over" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0013W1" type="Balance" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0013W1" type="Short" backgroundColor="#f1c40f" />
                                        <InfoTile records={records} org="C0013W1" type="Empty" backgroundColor="#e74c3c" />
                                    </div>
                                </Row>
                                <br />
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0013W1')}>Download</Button>
                            </Card>
                        </Col>
                        <Col lg={4} xs={24}>
                            <Card title="PANI" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0022W1" type="Over" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0022W1" type="Balance" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0022W1" type="Short" backgroundColor="#f1c40f" />
                                        <InfoTile records={records} org="C0022W1" type="Empty" backgroundColor="#e74c3c" />
                                    </div>
                                </Row>
                                <br />
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0022W1')}>Download</Button>
                            </Card>
                        </Col>
                        <Col lg={4} xs={24}>
                            <Card title="TOKA" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0004W1" type="Over" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0004W1" type="Balance" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0004W1" type="Short" backgroundColor="#f1c40f" />
                                        <InfoTile records={records} org="C0004W1" type="Empty" backgroundColor="#e74c3c" />
                                    </div>
                                </Row>
                                <br />
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0004W1')}>Download</Button>
                            </Card>
                        </Col>
                        <Col lg={4} xs={24}>
                            <Card title="WEDA" headStyle={{ fontSize: 25, backgroundColor: 'rgba(100, 100, 100, 0.2)' }} style={{ backgroundColor: 'transparent' }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0015W1" type="Over" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0015W1" type="Balance" backgroundColor="#2ecc71" />
                                        <InfoTile records={records} org="C0015W1" type="Short" backgroundColor="#f1c40f" />
                                        <InfoTile records={records} org="C0015W1" type="Empty" backgroundColor="#e74c3c" />
                                    </div>
                                </Row>
                                <br />
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportItems('C0015W1')}>Download</Button>
                            </Card>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={[10, 10]}>
                        <Col lg={4} xs={24}>
                            <h2>Bakan</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((records.filter((r) => r.organization == 'C0021W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0021W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Tanjung Buli</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((records.filter((r) => r.organization == 'C0019W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0019W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>GAG</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((records.filter((r) => r.organization == 'C0013W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0013W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Pani</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((records.filter((r) => r.organization == 'C0022W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0022W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Toka</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((records.filter((r) => r.organization == 'C0004W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0004W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Weda</h2>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={sanitizeNumber((records.filter((r) => r.organization == 'C0015W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0015W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} strokeWidth={15} />
                        </Col>
                    </Row>
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
                        <Col lg={4} xs={24}>
                            <h2>Tanjung Buli</h2>
                            <Line data={snapshots.filter((r) => r.organization == 'C0019W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>GAG</h2>
                            <Line data={snapshots.filter((r) => r.organization == 'C0013W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Pani</h2>
                            <Line data={snapshots.filter((r) => r.organization == 'C0022W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Toka</h2>
                            <Line data={snapshots.filter((r) => r.organization == 'C0004W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col lg={4} xs={24}>
                            <h2>Weda</h2>
                            <Line data={snapshots.filter((r) => r.organization == 'C0015W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={[10, 10]}>
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
                    </Row>
                </div>
            </div>
        </>
    )
}

function InfoTile({ records, org, type, backgroundColor }: { records: any[], org: string, type: string, backgroundColor?: string }) {
    return (
        <div style={{ display: 'flex', flex: 1, marginBottom: 5 }}>
            <div style={{ display: 'flex', flex: 1, borderColor: '#222222', borderWidth: 1, borderStyle: 'solid', padding: 5, fontWeight: 'bold', backgroundColor, fontSize: 20 }}>{type}</div>
            <div style={{ display: 'flex', flex: 2, borderColor: '#222222', borderWidth: 1, borderStyle: 'solid', padding: 5, borderLeft: 0, fontSize: 20 }}>{records.filter((r) => r.organization == org && r.remark == type.toUpperCase()).length}</div>
        </div>
    )
}