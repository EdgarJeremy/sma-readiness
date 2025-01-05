import { Application } from "@feathersjs/feathers/lib"
import { useParsed, useShow } from "@refinedev/core"
import { IEvent } from "../../interfaces/events";
import { Row, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { IInvitee } from "../../interfaces/invitees";

const Title = Typography.Title;

export const WelcomePage = ({ client }: { client: Application }) => {
    const { params } = useParsed();
    const { queryResult } = useShow<IEvent>({
        resource: 'events',
        id: params?.event_id
    });
    const { data, isLoading } = queryResult;
    const event = data?.data;

    const [invitee, setInvitee] = useState<IInvitee | null>(null);

    useEffect(() => {
        if (!isLoading) {
            document.title = event?.name!;
            // @ts-ignore
            window.updateInvitee = (i) => setInvitee(i)
        }
    }, [isLoading])

    return isLoading ? (<div className='full-container'><Spin size="large" /></div>) : (
        <>
            <div style={{
                backgroundImage: `url(${import.meta.env.VITE_API_URL}/event_images/${params?.event_id}/station_image)`,
                backgroundPosition: 'center', 
                backgroundSize: 'cover',
                position: 'fixed',
                inset: 0,
                zIndex: -2,
                opacity: .25
            }}></div>
            <div style={{ textAlign: 'center', paddingTop: 20, color: "black" }}>
                <Title level={2} style={{ margin: 0, color: "black" }}>{event?.name}</Title>
                <Title level={4} style={{ fontWeight: 'lighter', margin: 0, marginBottom: 20, color: "black" }}>
                </Title>
            </div>
            {invitee && <div className="full-container">
                <Row style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Title level={4} style={{ fontWeight: 'lighter', margin: 0, color: "black" }}>Welcome!</Title>
                <Title level={2} style={{ margin: 0, color: "black" }}>{invitee.name}</Title>
                {invitee.priority && <Title level={2} style={{ margin: 0, color: '#b39700' }}>V I P</Title>}
                </Row>
            </div>}
        </>
    )
}