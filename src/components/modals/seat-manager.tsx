import React, { useEffect, useState } from 'react';
import { useList, useCreateMany, useUpdate, useDataProvider, useDeleteMany } from '@refinedev/core';
import { Button, Card, Input, InputNumber, Modal, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import Draggable, { DraggableEventHandler } from 'react-draggable';
import { ISeat } from "../../interfaces/seats";
import { SeatCanvas } from '../../seat-canvas';
import { Object } from 'fabric/fabric-impl';

export interface ISeatManagerProps {
    event_id: string;
    title: string;
    centered: boolean;
    open: boolean;
    onOk: (e: React.MouseEvent) => void;
    onCancel: (e: React.MouseEvent) => void;
    width: number;
    max_seat: number;
}

export const SeatManager = ({ event_id, title, centered, open, onOk, onCancel, width, max_seat }: ISeatManagerProps) => {

    const { data: existingSeats, isLoading: seatLoading, refetch } = useList<ISeat>({
        resource: 'seats',
        filters: [{
          field: 'event_id',
          operator: 'eq',
          value: event_id
        }],
        pagination: {
            pageSize: 1000
        }
    });

    const [seatCanvas, setSeatCanvas] = useState<SeatCanvas | null>(null);
    const [ seats, setSeats ] = useState<ISeat[]>(seatLoading ? [] : existingSeats!.data);

    const [ saveLoading, setSaveLoading ] = useState(false);
    const { mutateAsync: createMany } = useCreateMany();
    const { mutateAsync: update, } = useUpdate();
    const { mutateAsync: deleteMany } = useDeleteMany();
    const [totalSeats, setTotalSeats] = useState(0);

    const [selectedSeat, setSelectedSeat] = useState<Object[] | undefined>(undefined);
    const [deletedSeats, setDeletedSeats] = useState<fabric.Object[]>([]);

    useEffect(() => {
        if (!seatLoading) setSeats([...existingSeats!.data])
        if (!seatLoading && open && !seatCanvas) {
            const sc = new SeatCanvas('canvas');
            setSeatCanvas(sc);
            drawSeats(existingSeats!.data, sc);

            const onSelected = (e: fabric.IEvent<MouseEvent>)=>{
                setSelectedSeat(e.selected);
            }

            sc.canvas.on("selection:created", onSelected);
            sc.canvas.on("selection:updated", onSelected);
            sc.canvas.on("selection:cleared", onSelected);
        }
        return
    }, [seatLoading, open]);

    const onRemoveSeat = ()=>{
        if(!seatCanvas) return;
        if(!selectedSeat) return;

        selectedSeat.forEach((s)=>{
            seatCanvas.removeChair(s);
        })
        deletedSeats.push(...selectedSeat);
        setDeletedSeats([...deletedSeats]);

        seatCanvas.canvas.discardActiveObject();
        setSelectedSeat(undefined);
        setTotalSeats(s=>s-1);
    }

    const onClearSeatInvitee = () => {
        if (!seatCanvas) return;
        if (!selectedSeat) return;

        const seat = selectedSeat[0];
        const chair = seatCanvas.getChair(seat.data.number);
        chair.set("data", {...seat.data, invitee_id: null, updated: true });
        const rect = chair.getObjects('rect')[0];
        if (!rect) return;
        rect.set("fill", seatCanvas.chairFill);
        seatCanvas.canvas.requestRenderAll();
        seatCanvas.canvas.renderAll();
    }

    const addChair = (seat: ISeat, sc: SeatCanvas) => {
        sc.addChair({
            angle: seat.angle,
            top: seat.top,
            left: seat.left,
            width: seat.width,
            height: seat.height,
            scale_x: seat.scale_x,
            scale_y: seat.scale_y,
            data: { id: seat.id, invitee_id: seat.invitee_id, number: seat.number.toString() }
        }, false, !!seat.invitee_id)
        setTotalSeats(s=>s+1);
    }
    
    const drawSeats = (seats: ISeat[], sc: SeatCanvas) => {
        for (let i=0; i<seats.length;i++) addChair(seats[i], sc);
    }

    const onSeatNumberChange = (seat: fabric.Object, value: string)=>{
        if (!seatCanvas) return;
        if (!value) return;
        if (!selectedSeat) return;

        selectedSeat[0].data.number = value;
        setSelectedSeat([...selectedSeat]);
        const chair = seatCanvas.getChair(seat.data.number);
        if (!chair) return;
        chair.set("data", {...seat.data, number: `${value}`, updated: true });
        const text = chair.getObjects('text')[0];
        if (!text) return;
        // @ts-ignore
        text.text = `${value}`;
        seatCanvas.canvas.requestRenderAll();
        seatCanvas.canvas.renderAll();
    }

    const onAddSeat = () => {
        const number = seatCanvas?.canvas.getObjects('chair').length! + 1;
        if(!seatCanvas) return;

        addChair({
            angle: 0, top: 0, left: 0, data: { number: number.toString() },
            number: number,
            scale_x: 1,
            scale_y: 1
        }, seatCanvas);
    }

    const saveSeat = async () => {
        const newChairs = seatCanvas?.canvas.getObjects('chair')
            .filter((c) => !c.data.id).map((c) => ({ 
                event_id: parseInt(event_id), number: parseInt(c.data.number),
                angle: c.angle, top: c.top, left: c.left, width: c.width, height: c.height,
                scale_x: c.scaleX, scale_y: c.scaleY
            }));
        const updatedChairs = seatCanvas?.canvas.getObjects('chair')
            .filter((c) => c.data.updated).map((c) => ({
                id: c.data.id, event_id: parseInt(event_id), invitee_id: c.data.invitee_id, number: parseInt(c.data.number),
                angle: c.angle, top: c.top,  left: c.left, width: c.width, height: c.height,
                scale_x: c.scaleX, scale_y: c.scaleY
            }));
        const deletedChairs = deletedSeats.filter((s) => s.data.id).map((s) => s.data.id);
        console.log('newChairs', newChairs);
        console.log('updatedChairs', updatedChairs);
        console.log('deletedChairs', deletedChairs);

        setSaveLoading(true);
        // @ts-ignore
        await createMany({ resource: 'seats', values: newChairs });
        for (let i = 0; i < updatedChairs!.length; i++) {
            await update({ id: updatedChairs![i].id!, resource: 'seats', values: updatedChairs![i] });
        }
        await deleteMany({ resource: 'seats', ids: deletedChairs });
        setSaveLoading(false);
        const { data, isLoading } = await refetch();
        setSeats([ ...data!.data ]);
        seatCanvas?.canvas.clear();
        seatCanvas?.initCanvas();
        drawSeats(data!.data, seatCanvas!);
    }

    return (
        <>
            <Modal
                title={title}
                centered={centered}
                open={open}
                onOk={saveSeat}
                onCancel={onCancel}
                width={width}
                okButtonProps={{ loading: saveLoading, onClick: saveSeat }}
                okText="Save">
                <div>
                    <Button style={{ marginBottom: 10, marginRight: 10 }} type="primary" onClick={onAddSeat}><PlusOutlined /> Add Seat</Button>
                    <Tag color={totalSeats > max_seat ? "red": "blue"}>({totalSeats}/{max_seat})</Tag>
                    {selectedSeat &&
                        <Button style={{ marginBottom: 10, marginRight: 10 }} type="primary" danger onClick={onRemoveSeat}>Remove {selectedSeat.length} Seat</Button>}
                    {selectedSeat?.length === 1 && 
                        <Button style={{ marginBottom: 10, marginRight: 10 }} type="dashed" onClick={onClearSeatInvitee}>Clear Invitee</Button>}
                    {selectedSeat?.length === 1 &&
                        <InputNumber
                            value={selectedSeat[0].data.number} 
                            onChange={(e) => onSeatNumberChange(selectedSeat[0], e)}
                        />}
                </div>
                <Card bodyStyle={{ overflow: 'scroll', height: 700 }} loading={seatLoading}>
                    <canvas id="canvas" width={5000} height={5000}></canvas>
                </Card>
            </Modal>
        </>
    )
}