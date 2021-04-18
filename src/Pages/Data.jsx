import React, { useState, useEffect } from 'react'
import { Spin, Table, Button, Input, Switch, Radio, Space, message, Typography } from 'antd'
import {SaveOutlined} from '@ant-design/icons';
import BackgroundImg from './background.png'
import {saveAs} from 'file-saver'
import xlsx from 'xlsx'
import axios from 'axios';
const book = xlsx.utils.book_new();
const { Text, Title } = Typography;

const Data = (props) => {
    console.log(props)
    const [taobaoResult, setTaobaoResult] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(props.match.params.name !== undefined){
            setLoading(true)
            axios.get(`${process.env.PUBLIC_URL}/Source/${props.match.params.name}.json`)
            .then(res => {
                
                if(res.data !== taobaoResult){
                    let newres = res.data.map(el=>{
                      el.cheapest = 0;
                      el.disabled = false
                      el.selected = ''
                      el.weight = 1
                      return el
                    })
                    setTaobaoResult(newres)
                    setLoading(false)
                }
            })
            .catch(()=>{
              message.error('데이터 로드에 실패했습니다.')
              setLoading(false)
            })
        }
    }, [props])

    const taobaoColumn = [{
        title: 'title', 
        key: 'fileName', 
        dataIndex: 'fileName',
        render: (value, record, index) => <Space direction="vertical">
          {/* <img src={`${imageFolder}/${value}`} /> */}
          <Text>{value}</Text>
        </Space>,
        align: 'center',
        width: 80
      },{
        title: 'data',
        dataIndex: 'data',
        key: 'data',
        width: 952,
        align: 'left',
        render: (value, record, index) => {
          const onChange = e => {
            let value = e.target.value
            let list = [...taobaoResult]
            list[index].selected = value
            list[index].cheapest = list[index].data[value].price
            setTaobaoResult(list)
          }
          return value && value !== undefined ? 
          <Radio.Group name={record.fileName} onChange={onChange} value={record.selected}>
          <Space>
            {value.map((el, i) => 
              <div style={{width: '110px'}} key={i}>
                <Radio value={i}>{i+1}</Radio>
                <div style={record.selected !== '' && record.selected !== i ? {opacity: 0.6} : {}}>
                <a href={el.link.charAt(0) === '/' ? `https:${el.link}` : el.link} target='_blank'><img className='taobaoThumb' src={el.imgsrc} /></a>
                <div>
                  <Title level={5}>
                    ¥ {el.price}
                    <Text style={{float:'right', fontSize: '12px', fontWeight: 500, marginTop: '2px'}} mark>{el.count.replace('人付款','건')}</Text>
                  </Title>
                </div>
                <Space>
                  {el.badge.length === 0 ? 
                    <span style={{display: 'inline-block', width:16, height: 16}}></span>
                    : el.badge.map((elm, i)=> <span key={i} style={{backgroundImage: `url(${BackgroundImg})`}} className={elm}></span>)}
                </Space>
                </div>
              </div>)
            }
          </Space></Radio.Group> : '' 
        },
      },{
        title: 'weight',
        dataIndex: 'weight',
        key: 'weight',
        align: 'center',
        render: (value, record, index) => {
          const editTitle = (e) => {
            let value = e.target.value
            let list = [...taobaoResult]
            list[index].weight = value
            setTaobaoResult(list)
          }
          return <Input disabled={record.disabled} bordered={false} style={{fontSize: '12px'}} value={value} onChange={editTitle}/>
        },
      },{
        title: 'active', 
        dataIndex: 'disabled',
        key: 'disabled', 
        render: (value, record, i) => {
          return <Switch
            checked={!value}
            size="small"
            onChange={(checked) => {
              let list = [...taobaoResult]
              list[i].disabled = !checked
              setTaobaoResult(list)
            }}
          />},
        align: 'center',
        width: 60
      }
    ]

    const saveTaobaoData = async () => {
        let newData = taobaoResult.filter(el => el.disabled === false)
        let checkDone = newData.filter(el => el.selected === '' || el.cheapest === 0)
        console.log(newData, checkDone)
        if(checkDone.length > 0) {
          message.error('데이터를 확인해주세요. 가격이나 선택이 빠진 상품이 있습니다.')
        }else{
          let parseData = await Promise.all(newData.map(el => {
            return [
              el.fileName.replace('.jpg', ''),
              el.data[el.selected].link,
              el.cheapest,
              el.weight
            ]
          }))
          saveToExcel(parseData)
        }
    }

    const saveToExcel = async(data) => {
        try {
          console.log('생성시작')
          let dataWithTitle = [['filename', 'url', '최저가격','무게']]
          for(let i=0; i<data.length; i++){
            dataWithTitle.push(data[i])
          }
          console.log(dataWithTitle)
          let sheetData = xlsx.utils.aoa_to_sheet(dataWithTitle)
          console.log('시트데이터 생성완료')
          xlsx.utils.book_append_sheet(book, sheetData, 'data')
          console.log('시트데이터 삽입완료')
          const result = await xlsx.write(book, {bookType: 'xlsx', type: 'binary'})
          saveAs(new Blob([s2ab(result)],{type:"application/octet-stream"}), 'result.xlsx');
          console.log('파일생성완료')
          message.success('저장이 완료되었습니다.')
        }catch{
          message.error('뭔가 잘못됨')
        }
    }

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
    }

    return (
      <Spin spinning={loading}>
        <Table
            title={()=><Button disabled={taobaoResult.length === 0} onClick={saveTaobaoData} block type="primary" icon={<SaveOutlined />}>데이터 저장하기</Button>}
            style={{marginTop: '20px'}}
            dataSource={taobaoResult}
            size='small'
            columns={taobaoColumn}
            pagination={false}
            rowKey='fileName'
            bordered
            rowClassName={(record, index)=> record.disabled ? 'disabled' : ''}
        />
      </Spin>
    )
}
export default Data