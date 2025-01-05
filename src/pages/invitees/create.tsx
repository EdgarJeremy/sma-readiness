import React from "react";
import { IResourceComponentsProps, useParsed } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, InputNumber, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";

export const InviteeCreate: React.FC<IResourceComponentsProps> = () => {
    const { params } = useParsed();
    const navigate = useNavigate();
    console.log(params);
    const { formProps, saveButtonProps, queryResult } = useForm({
        onMutationSuccess: async (data, variables, context, isAutoSave) => {
            navigate(-1);
        },
    });

    formProps.initialValues = { ...formProps.initialValues, event_id: parseInt(params?.event_id), priority: false }

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item name={["event_id"]} hidden>
                    <InputNumber />
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
                    rules={[{
                        required: true
                    }]}
                    valuePropName="checked"
                >
                    <Checkbox>Set as VIP</Checkbox>
                </Form.Item>
            </Form>
        </Create>
    );
};
