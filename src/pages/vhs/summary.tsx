import { Application } from '@feathersjs/feathers';
import { useList, useParsed } from '@refinedev/core';
import { Col, Row, Spin, Typography, Statistic, Card, Table, Tag } from 'antd';
import { CheckOutlined, FileDoneOutlined, UserOutlined, InsertRowAboveOutlined, SendOutlined, CloseOutlined, InfoOutlined } from '@ant-design/icons';
import { NumberField, TextField, DateField, UrlField, useTable } from '@refinedev/antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ISeat } from '../../interfaces/seats';
import { IInvitee } from '../../interfaces/invitees';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { SeatCanvas } from '../../seat-canvas';

const Title = Typography.Title;

export const VhsPage = ({ client }: { client: Application}) => {
    const { params } = useParsed();
    const [ invitees, setInvitees ] = useState<IInvitee[] | null>(null);
    const [ seats, setSeats ] = useState<ISeat[] | null>(null);
    const { data, isLoading } = useList({
        resource: 'events',
        filters: [{
            field: 'shorturi',
            operator: 'eq',
            value: params?.shorturi
        }]
    });
    
    useEffect(() => { 
        document.body.style.backgroundColor = '#ecf0f1';
    }, [])

    useEffect(() => {
        async function fetch() {
            if (!isLoading) {
                const event = data!.data[0];
                document.body.style.backgroundImage = `url(${import.meta.env.VITE_API_URL}/event_images/${event.id}/summary_image)`;
                document.body.style.backgroundSize = 'cover';
                const seat = await client.service('seats').find({
                    query: { $limit: 1000, event_id: event.id }
                });
                const invitee = await client.service('invitees').find({
                    query: { $limit: 1000, event_id: event.id }
                });
                setSeats(seat.data);
                setInvitees(invitee.data);
            }
        }
        fetch();
    }, [isLoading]);

    useEffect(() => {
        if (seats) {
            const sc = new SeatCanvas('canvas');
            drawSeats(seats!, sc);
            sc.setUnselectable();
        }
    }, [seats])

    const drawSeats = (seats: ISeat[], sc: SeatCanvas) => {
        const chairs = [];
        for (let i=0; i<seats.length;i++) {
            const chair =  sc.addChair({
                angle: seats[i].angle,
                top: seats[i].top,
                left: seats[i].left,
                width: seats[i].width,
                height: seats[i].height,
                scale_x: seats[i].scale_x,
                scale_y: seats[i].scale_y,
                data: { id: seats[i].id, number: seats[i].number.toString() }
            }, false, !!seats[i].invitee_id);
            chairs.push(chair)
        }
    }

    const loading = isLoading;

    if (loading) return <div className='full-container'><Spin size="large"/></div>;
    if (!data!.data.length) return <></>;

    const event = data!.data[0];


    return (
        <>
            <div style={{ textAlign: 'center', padding: 20 }}>
                <Typography.Title level={2}>{event.name}</Typography.Title>
                <Typography.Paragraph>{moment(event.date).format('MMMM Do YYYY')} at {moment(event.time).format('hh:mm A')}</Typography.Paragraph>
            </div>
            <div style={{ margin: '0 100px' }}>
                <Row gutter={[10, 10]}>
                    <Col span={24}>
                        <Card>
                            <Row>
                                <Col span={8}>
                                    <Title level={5}>Event Name</Title>
                                    <TextField value={event?.name} />
                                    <Title level={5}>Date</Title>
                                    <DateField value={event?.date} />
                                </Col>
                                <Col span={8}>
                                    <Title level={5}>Message</Title>
                                    <TextField value={event?.message} />
                                    <Title level={5}>Time</Title>
                                    <DateField format="hh:mm A" value={event?.time} />
                                </Col>
                                <Col span={8}>
                                    <Title level={5}>Invitation Link</Title>
                                    <TextField value={<UrlField value={event?.invitation_link} />} />
                                    <Title level={5}>Created By</Title>
                                    <TextField value={event?.created_by?.name} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                loading={!invitees}
                                title="Total Invitation"
                                value={invitees?.length}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<FileDoneOutlined />}
                                suffix=""
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total People"
                                value={invitees?.map((i) => i.total_person).reduce((p, c) => p + c, 0)}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<UserOutlined />}
                                suffix=""
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="People Arrived"
                                value={seats?.filter((s) => s.invitee_id).length}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<UserOutlined />}
                                suffix=""
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Seat"
                                value={seats?.length}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<InsertRowAboveOutlined />}
                                suffix=""
                            />
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card title="Seat Map">
                            <div style={{ height: 200, overflow: 'scroll' }}>
                                <canvas id="canvas" width={5000} height={5000}></canvas>
                                {/* <div style={{ width: 2000, height: 2000, position: 'relative' }}>
                                    {seats && seats.map((s, i) => (
                                        <Draggable disabled key={i} bounds="parent" grid={[10, 10]} defaultPosition={{ x: s.x, y: s.y }}>
                                            <div className={`seat-item ${s.invitee_id ? 'occupied' : ''} editor`}>{s.number}</div>
                                        </Draggable>
                                    ))}
                                </div> */}
                            </div>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card title="Invitee List">
                            <div style={{ overflow: 'scroll' }}>
                                <Table dataSource={invitees!} loading={loading} rowKey="id">
                                    <Table.Column dataIndex="name" title="Name" />
                                    <Table.Column dataIndex="total_person" title="Total Person" />
                                    <Table.Column dataIndex="arrived_at" title="Arrived At" render={(v) => v ? <DateField value={v} format="hh:mm A" /> : '-'} />
                                    <Table.Column dataIndex="status" title="Status" render={(v: 'sent' | 'read' | 'accepted' | 'declined') => {
                                        const colorMap = {
                                            sent: 'default',
                                            read: 'blue',
                                            accepted: 'green',
                                            declined: 'red'
                                        }
                                        const iconMap = {
                                            sent: <SendOutlined />,
                                            read: <InfoOutlined />,
                                            accepted: <CheckOutlined />,
                                            declined: <CloseOutlined />
                                        }
                                        return <Tag color={colorMap[v]}>{iconMap[v]} {v.toUpperCase()}</Tag>
                                    }} />
                                    <Table.Column dataIndex="priority" title="Priority" render={(v) => v ? "Yes" : "No" } />
                                </Table>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    )
}