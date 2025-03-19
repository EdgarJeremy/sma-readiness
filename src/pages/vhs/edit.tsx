import React, { useEffect } from "react";
import { IResourceComponentsProps, file2Base64 } from "@refinedev/core";
import { Edit, useForm, getValueFromEvent } from "@refinedev/antd";
import { Form, Input, DatePicker, TimePicker, InputNumber, Upload } from "antd";
import { AntdEditInferencer } from '@refinedev/inferencer/antd'
import dayjs from "dayjs";

export const VhsEdit: React.FC<IResourceComponentsProps> = () => {
    const { formProps, saveButtonProps, queryResult } = useForm();
    const itemsData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical"
                onFinish={async (values) => {
                    let { summary_image, station_image }: any = values;
                    if (summary_image)
                        summary_image = await file2Base64(summary_image[0]);
                    if (station_image)
                        station_image = await file2Base64(station_image[0]);

                    return (
                        formProps.onFinish &&
                        formProps.onFinish({
                            ...values,
                            summary_image,
                            station_image
                        })
                    )
                }}>
                <Form.Item
                    label="Id"
                    name={["id"]}
                    rules={[{ required: true }]}>
                    <Input readOnly disabled />
                </Form.Item>
                <Form.Item
                    label="Name"
                    name={["name"]}
                    rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Date"
                    name={["date"]}
                    rules={[{ required: true }]}
                    getValueProps={(value) => ({ value: dayjs(value) })}>
                        <DatePicker />
                </Form.Item>
                <Form.Item
                    label="Time"
                    name={["time"]}
                    rules={[{ required: true }]}
                    getValueProps={(value) => ({ value: dayjs(value) })}>
                        <TimePicker />
                </Form.Item>
                <Form.Item
                    label="Total Seats"
                    name={["total_seats"]}
                    rules={[{ required: true }]}>
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    label="Message (Available token: {id}, {name}, {url})"
                    name={["message"]}
                    rules={[{ required: true }]}>
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Invitation Link (Put invitation ID by specifying {id} in the URL)"
                    name={["invitation_link"]}
                    rules={[
                        {
                          required: true
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Summary Image"
                    name="summary_image"
                    valuePropName="fileList"
                    getValueFromEvent={getValueFromEvent}
                    rules={[{ required: false } ]}>
                    <Upload.Dragger
                        listType="picture"
                        beforeUpload={() => false}
                    >
                        <p className="ant-upload-text">
                            Drag & drop a file in this area
                        </p>
                    </Upload.Dragger>
                </Form.Item>
                <Form.Item
                    label="Scan Station Image"
                    name="station_image"
                    valuePropName="fileList"
                    getValueFromEvent={getValueFromEvent}
                    rules={[{ required: false } ]}>
                    <Upload.Dragger
                        listType="picture"
                        beforeUpload={() => false}
                    >
                        <p className="ant-upload-text">
                            Drag & drop a file in this area
                        </p>
                    </Upload.Dragger>
                </Form.Item>
            </Form>
        </Edit>
    );
};