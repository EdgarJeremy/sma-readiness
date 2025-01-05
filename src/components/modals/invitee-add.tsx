import React from "react";
import {
  Modal,
  Button,
  Card,
  Table,
  Input,
  Form,
  InputNumber,
  Checkbox,
} from "antd";
import { DateField, SaveButton, useForm, useTable } from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { IInvitee } from "../../interfaces/invitees";

export interface IInviteeAddProps {
  event_id: number;
  title: string;
  centered: boolean;
  open: boolean;
  width: number;
  onCancel: () => void;
  onSubmit: (e: IInvitee) => void;
}

export const InviteeAdd = ({
  event_id,
  title,
  centered,
  open,
  width,
  onCancel,
  onSubmit,
}: IInviteeAddProps) => {
  const { formProps, saveButtonProps} = useForm({
    action: "create",
    resource: "invitees",
    onMutationSuccess(data, variables, context, isAutoSave) {
      onSubmit(data.data as IInvitee);
    },
  });
  formProps.initialValues = {
    ...formProps.initialValues,
    event_id: event_id,
    priority: false,
  };

  return (
    <>
      <Modal
        title={title}
        centered={centered}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={width}
      >
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
            rules={[
              {
                required: true,
              },
            ]}
            valuePropName="checked"
          >
            <Checkbox>Set as VIP</Checkbox>
          </Form.Item>
        </Form>
        <SaveButton {...saveButtonProps} />
      </Modal>
    </>
  );
};
