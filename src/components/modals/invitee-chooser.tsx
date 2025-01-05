import React from 'react';
import { Modal, Button, Card, Table, Input } from 'antd';
import { DateField, useTable } from '@refinedev/antd';
import { BaseRecord } from '@refinedev/core';
import { IInvitee } from '../../interfaces/invitees';

export interface IInviteeChooserProps {
    event_id: number;
    title: string;
    centered: boolean;
    open: boolean;
    width: number;
    onCancel: () => void;
    onChooseInvitee: (e: IInvitee) => void;
}

export const InviteeChooser = ({ event_id, title, centered, open, width, onCancel, onChooseInvitee }: IInviteeChooserProps) => {
    
    const { tableProps, setFilters } = useTable({
        resource: 'invitees',
        filters: {
            permanent: [{
                field: 'event_id',
                operator: 'eq',
                value: event_id
            }]
        }
    });
    
    return (
        <>
            <Modal
                title={title}
                centered={centered}
                open={open}
                onCancel={onCancel}
                footer={null}
                width={width}>
                <Card>
                    <Input.Search placeholder='Type invitee name...' size='large' onChange={(v) => {
                        setFilters([{
                            field: 'name',
                            operator: 'contains',
                            value: v.target.value
                        }])
                    }} />
                    <Table {...tableProps} rowKey="id">
                        <Table.Column dataIndex="qr" title="QR" render={(v) => <img src={v} width={30}/>} />
                        <Table.Column dataIndex="name" title="Name" />
                        <Table.Column dataIndex="total_person" title="Total Person" />
                        <Table.Column dataIndex="phone" title="Phone Number" />
                        <Table.Column dataIndex="arrived_at" title="Arrived At" render={(v) => v ? <DateField value={v} format="hh:mm A" /> : '-'} />
                        <Table.Column dataIndex="priority" title="Priority" render={(v) => v ? "Yes" : "No" } />
                        <Table.Column
                            title="Actions"
                            dataIndex="actions"
                            render={(_, r: IInvitee) => (
                                <Button onClick={() => { onChooseInvitee(r); onCancel() }}>Choose</Button>
                            )}
                        />
                    </Table>
                </Card>
            </Modal>
        </>
    )
}