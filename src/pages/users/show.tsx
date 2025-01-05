import React from "react";
import { IResourceComponentsProps, useShow, useTable } from "@refinedev/core";
import {
    Show,
    NumberField,
    TagField,
    TextField,
    EmailField,
    DateField,
} from "@refinedev/antd";
import { Typography } from "antd";

const { Title } = Typography;

export const UserShow: React.FC<IResourceComponentsProps> = () => {
    const { queryResult } = useShow();
    const { data, isLoading } = queryResult;

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Id</Title>
            <NumberField value={record?.id ?? ""} />
            <Title level={5}>Name</Title>
            <TextField value={record?.name} />
            <Title level={5}>Type</Title>
            <TextField value={record?.type === 'administrator' ? 'Administrator' : 'Vendor'} />
            <Title level={5}>Username</Title>
            <EmailField value={record?.username} />
            <Title level={5}>Created At</Title>
            <DateField value={record?.created_at} />
            <Title level={5}>Updated At</Title>
            <DateField value={record?.updated_at} />
        </Show>
    );
};