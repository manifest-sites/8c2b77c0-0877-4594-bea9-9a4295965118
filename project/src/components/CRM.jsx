import { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Client } from '../entities/Client'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const eventTypeColors = {
  wedding: 'pink',
  funeral: 'gray',
  corporate: 'blue',
  birthday: 'orange',
  anniversary: 'gold',
  other: 'default'
}

const statusColors = {
  prospect: 'default',
  quoted: 'blue',
  booked: 'green',
  completed: 'success',
  cancelled: 'error'
}

function CRM() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [form] = Form.useForm()

  const loadClients = async () => {
    setLoading(true)
    try {
      const response = await Client.list()
      if (response.success) {
        setClients(response.data)
      }
    } catch (error) {
      message.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleAddClient = () => {
    setEditingClient(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    form.setFieldsValue({
      ...client,
      eventDate: client.eventDate ? dayjs(client.eventDate) : null,
      contactDate: client.contactDate ? dayjs(client.contactDate) : null
    })
    setModalVisible(true)
  }

  const handleDeleteClient = async (clientId) => {
    try {
      await Client.delete(clientId)
      message.success('Client deleted successfully')
      loadClients()
    } catch (error) {
      message.error('Failed to delete client')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const clientData = {
        ...values,
        eventDate: values.eventDate ? values.eventDate.format('YYYY-MM-DD') : null,
        contactDate: values.contactDate ? values.contactDate.format('YYYY-MM-DD') : null
      }

      if (editingClient) {
        await Client.update(editingClient._id, clientData)
        message.success('Client updated successfully')
      } else {
        await Client.create(clientData)
        message.success('Client added successfully')
      }
      
      setModalVisible(false)
      loadClients()
    } catch (error) {
      message.error('Failed to save client')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <div className="text-gray-500 text-sm">{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (eventType) => (
        <Tag color={eventTypeColors[eventType] || 'default'}>
          {eventType?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Wedding', value: 'wedding' },
        { text: 'Funeral', value: 'funeral' },
        { text: 'Corporate', value: 'corporate' },
        { text: 'Birthday', value: 'birthday' },
        { text: 'Anniversary', value: 'anniversary' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value, record) => record.eventType === value,
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
      sorter: (a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Prospect', value: 'prospect' },
        { text: 'Quoted', value: 'quoted' },
        { text: 'Booked', value: 'booked' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => budget ? `$${budget.toLocaleString()}` : '-',
      sorter: (a, b) => (a.budget || 0) - (b.budget || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditClient(record)}
            size="small"
            type="text"
          />
          <Popconfirm
            title="Are you sure you want to delete this client?"
            onConfirm={() => handleDeleteClient(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="text"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client CRM</h1>
          <p className="text-gray-600">Manage your floral shop clients</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddClient}
          size="large"
        >
          Add Client
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={clients}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Email" name="email">
              <Input type="email" />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
          </div>

          <Form.Item label="Company/Organization" name="company">
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Event Type" name="eventType">
              <Select placeholder="Select event type">
                <Option value="wedding">Wedding</Option>
                <Option value="funeral">Funeral</Option>
                <Option value="corporate">Corporate</Option>
                <Option value="birthday">Birthday</Option>
                <Option value="anniversary">Anniversary</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Event Date" name="eventDate">
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="prospect">Prospect</Option>
                <Option value="quoted">Quoted</Option>
                <Option value="booked">Booked</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Budget" name="budget">
              <InputNumber
                className="w-full"
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <Form.Item label="Contact Date" name="contactDate">
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} placeholder="Add any notes about preferences, requirements, etc." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CRM