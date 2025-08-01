import React, { useState } from 'react'
import { Table, Button, Modal } from 'antd'
import { toast } from '../utils/notification'
import { userApi } from '../utils/api'
import { useRequest } from '../hooks/useRequest'
import { LoadingWrapper } from '../components/LoadingWrapper'

const UserList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  
  // 使用 useRequest Hook 获取用户列表
  const { data: userList, loading, run: fetchUsers } = useRequest(
    userApi.getUserList,
    {
      onSuccess: (data) => {
        console.log('获取用户列表成功:', data)
      },
      onError: (error) => {
        toast.error('获取用户列表失败')
      },
    }
  )

  // 删除用户
  const { run: deleteUser } = useRequest(
    userApi.deleteUser,
    {
      manual: true,
      onSuccess: () => {
        toast.success('删除成功')
        fetchUsers() // 重新获取列表
        setSelectedRowKeys([])
      },
      onError: () => {
        toast.error('删除失败')
      },
    }
  )

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: () => deleteUser(id),
    })
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2>用户列表</h2>
      <LoadingWrapper loading={loading}>
        <Table
          columns={columns}
          dataSource={userList}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </LoadingWrapper>
    </div>
  )
}

export default UserList