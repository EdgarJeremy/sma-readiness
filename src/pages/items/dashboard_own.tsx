import { Application } from "@feathersjs/feathers/lib"
import { useParsed, useShow } from "@refinedev/core"
import { IEvent } from "../../interfaces/events";
import { Row, Spin, Typography, Col, Card, Statistic, Progress, Divider } from "antd";
import { useEffect, useState } from "react";
import { IInvitee } from "../../interfaces/invitees";
import { FallOutlined, LineOutlined, RiseOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import moment from "moment";

const Title = Typography.Title;

export const DashboardOwn = ({ client }: { client: Application }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [snapshots, setSnapshots] = useState<any[]>([]);

    useEffect(() => {
        client.service('items').find({ query: { $limit: 20000 } }).then((res) => {
            console.log(res.data);
            setRecords(res.data);
            client.service('snapshots').find({ query: { $limit: 20000, $sort: { date: 1 } } }).then((res2) => {
                setSnapshots(res2.data);
                setIsLoading(false);
            }).catch((e) => { console.log(e) });
        }).catch((e) => { console.log(e) });
    }, [])

    return isLoading ? (<div className='full-container'><Spin size="large" /></div>) : (
        <>
            <div style={{ textAlign: 'center', paddingTop: 50, color: "black", height: '100vh', backgroundColor: '#efefef' }}>
                <Title level={2} style={{ margin: 0, color: "black" }}>READINESS DASHBOARD (OWN)</Title>
                <Title level={4} style={{ fontWeight: 'lighter', margin: 0, marginBottom: 50, color: "black" }}>
                    SMA Own Inventory Readiness Dashboard</Title>
                <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                    <Row gutter={[10, 10]}>
                        <Col span={4}>
                            <Card title="BAKN" headStyle={{ fontSize: 25 }}>
                                <Row gutter={[5, 15]}>
                                    {/* <Col span={12}><Statistic title="Over" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'OVER').length} valueStyle={{ fontSize: 20, color: '#2ecc71' }} prefix={<RiseOutlined />} /></Col>
                                    <Col span={12}><Statistic title="Balance" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'BALANCE').length} valueStyle={{ fontSize: 20, color: '#3498db' }} prefix={<LineOutlined />} /></Col>
                                    <Col span={12}><Statistic title="Short" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'SHORT').length} valueStyle={{ fontSize: 20, color: '#f39c12' }} prefix={<FallOutlined />} /></Col>
                                    <Col span={12}><Statistic title="Empty" value={records.filter((r) => r.organization == 'C0021W1' && r.remark == 'EMPTY').length} valueStyle={{ fontSize: 20, color: '#e74c3c' }} prefix={<CloseCircleOutlined />} /></Col> */}
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0021W1" type="Over" />
                                        <InfoTile records={records} org="C0021W1" type="Balance" />
                                        <InfoTile records={records} org="C0021W1" type="Short" />
                                        <InfoTile records={records} org="C0021W1" type="Empty" />
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card title="BULI" headStyle={{ fontSize: 25 }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0019W1" type="Over" />
                                        <InfoTile records={records} org="C0019W1" type="Balance" />
                                        <InfoTile records={records} org="C0019W1" type="Short" />
                                        <InfoTile records={records} org="C0019W1" type="Empty" />
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card title="GAGN" headStyle={{ fontSize: 25 }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0013W1" type="Over" />
                                        <InfoTile records={records} org="C0013W1" type="Balance" />
                                        <InfoTile records={records} org="C0013W1" type="Short" />
                                        <InfoTile records={records} org="C0013W1" type="Empty" />
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card title="PANI" headStyle={{ fontSize: 25 }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0022W1" type="Over" />
                                        <InfoTile records={records} org="C0022W1" type="Balance" />
                                        <InfoTile records={records} org="C0022W1" type="Short" />
                                        <InfoTile records={records} org="C0022W1" type="Empty" />
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card title="TOKA" headStyle={{ fontSize: 25 }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0004W1" type="Over" />
                                        <InfoTile records={records} org="C0004W1" type="Balance" />
                                        <InfoTile records={records} org="C0004W1" type="Short" />
                                        <InfoTile records={records} org="C0004W1" type="Empty" />
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card title="WEDA" headStyle={{ fontSize: 25 }}>
                                <Row gutter={[5, 15]}>
                                    <div style={{ flex: 1 }}>
                                        <InfoTile records={records} org="C0015W1" type="Over" />
                                        <InfoTile records={records} org="C0015W1" type="Balance" />
                                        <InfoTile records={records} org="C0015W1" type="Short" />
                                        <InfoTile records={records} org="C0015W1" type="Empty" />
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={[10, 10]}>
                        <Col span={4}>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={((records.filter((r) => r.organization == 'C0021W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0021W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} />
                        </Col>
                        <Col span={4}>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={((records.filter((r) => r.organization == 'C0019W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0019W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} />
                        </Col>
                        <Col span={4}>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={((records.filter((r) => r.organization == 'C0013W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0013W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} />
                        </Col>
                        <Col span={4}>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={((records.filter((r) => r.organization == 'C0022W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0022W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} />
                        </Col>
                        <Col span={4}>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={((records.filter((r) => r.organization == 'C0004W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0004W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} />
                        </Col>
                        <Col span={4}>
                            {/* @ts-ignore */}
                            <Progress type="dashboard" percent={((records.filter((r) => r.organization == 'C0015W1' && ['OVER', 'BALANCE'].indexOf(r.remark) != -1).length / records.filter((r) => r.organization == 'C0015W1').length) * 100).toFixed(2)} strokeColor={{ '0%': '#e74c3c', '20%': '#f1c40f', '50%': '#2ecc71' }} />
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={[10, 10]}>
                        <Col span={4}>
                            <Line data={snapshots.filter((r) => r.organization == 'C0021W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col span={4}>
                            <Line data={snapshots.filter((r) => r.organization == 'C0019W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col span={4}>
                            <Line data={snapshots.filter((r) => r.organization == 'C0013W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col span={4}>
                            <Line data={snapshots.filter((r) => r.organization == 'C0022W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col span={4}>
                            <Line data={snapshots.filter((r) => r.organization == 'C0004W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                        <Col span={4}>
                            <Line data={snapshots.filter((r) => r.organization == 'C0015W1').map((r) => ({ date: moment(r.date).format('YYYY-MM-DD'), readiness: Math.round(r.readiness * 100) / 100 }))} height={250} autoFit={true} xField="date" yField="readiness" point={{ size: 5, shape: 'diamond' }} label={{ style: { fill: '#aaa' } }} />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    )
}

function InfoTile({ records, org, type }: { records: any[], org: string, type: string }) {
    return (
        <div style={{ display: 'flex', flex: 1, marginBottom: 5 }}>
            <div style={{ display: 'flex', flex: 1, borderColor: '#222222', borderWidth: 1, borderStyle: 'solid', padding: 5, fontWeight: 'bold' }}>{type}</div>
            <div style={{ display: 'flex', flex: 2, borderColor: '#222222', borderWidth: 1, borderStyle: 'solid', padding: 5, borderLeft: 0 }}>{records.filter((r) => r.organization == org && r.remark == type.toUpperCase()).length}</div>
        </div>
    )
}