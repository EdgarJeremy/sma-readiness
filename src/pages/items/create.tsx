import React from "react";
import { IResourceComponentsProps, file2Base64 } from "@refinedev/core";
import { Create, useForm, getValueFromEvent } from "@refinedev/antd";
import { Form, Input, InputNumber, DatePicker, TimePicker, Upload } from "antd";
import dayjs from "dayjs";

export const ItemCreate: React.FC<IResourceComponentsProps> = () => {
    const { formProps, saveButtonProps, queryResult } = useForm();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical"
                onFinish={async (values) => {
                    return (
                        formProps.onFinish &&
                        formProps.onFinish({
                            ...values
                        })
                    )
                }}>
                <Form.Item
                    label="Site"
                    name={["site"]}
                    rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Organization"
                    name={["organization"]}
                    rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Item Number"
                    name={["item_number"]}
                    rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Category"
                    name={["category"]}
                    rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Min"
                    name={["min"]}
                    rules={[{ required: true }]}>
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    label="Max"
                    name={["max"]}
                    rules={[{ required: true }]}>
                    <InputNumber />
                </Form.Item>
            </Form>
        </Create>
    );
};
