import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, InputNumber, Checkbox } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export const InviteeEdit: React.FC<IResourceComponentsProps> = () => {
    const navigate = useNavigate();
    const { formProps, saveButtonProps, queryResult } = useForm({
        onMutationSuccess: async (data, variables, context, isAutoSave) => {
            navigate(-1);
        },
    });

    const eventsData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Id"
                    name={["id"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input readOnly disabled />
                </Form.Item>
                <Form.Item
                    label="Name"
                    name={["name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Total Person"
                    name={["total_person"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    label="Phone Number"
                    name={["phone"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Priority"
                    name={["priority"]}
                    rules={[]}
                    valuePropName="checked"
                >
                    <Checkbox>Set as VIP</Checkbox>
                </Form.Item>
            </Form>
        </Edit>
    );
};