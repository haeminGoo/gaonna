import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react';
import { Button, Col, Row, Tree } from 'antd';
import 'antd/dist/antd.css'
import JSZip from 'jszip';
import FileSaver from 'file-saver'

const JSZipUtils = global.JSZipUtils

function App() {
  const [category, setCategory] = useState([])
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState('')

  useEffect(()=> {
    if(category === undefined || category.length === 0){
      axios.get('https://store.coupang.com/vp/vendors/A00247600/product/filters?outboundShippingPlaceId=&attributeFilters=&brand=&componentId=449013&keyword=&maxPrice=&minPrice=&pageNum=1&rating=0&sortTypeValue=')
      .then(res =>{ 
        if(res.data.code === '200'){
          let formatted = res.data.data.storeWebCategoryFilters.map(el => renameKeys(el))
          setCategory(formatted)
        }
      })
    }
  }, [category])

  function renameKeys(obj) {
    const keyValues = Object.keys(obj).map(key => {
      let newKey = null
      if(key === 'id'){
        newKey = 'key'
      } else if(key === 'name'){
        newKey = 'title'
      } else {
        newKey = key
      }
      if (key === 'children') {
        obj[key] = obj[key].map(obj => renameKeys(obj));    
      }
      return {
        [newKey]: obj[key]
      };
    });
    return Object.assign({}, ...keyValues);
  }

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    if(selectedKeys.length > 0){setSelected(info.selectedNodes[0].title)}
    axios.get(`https://store.coupang.com/vp/vendors/A00247600/product/lists?outboundShippingPlaceId=&attributeFilters=&brand=&componentId=${selectedKeys[0]}&keyword=&maxPrice=&minPrice=&pageNum=1&rating=0&sortTypeValue=BEST_SELLING&scpLanding=false`)
      .then(res =>{ 
        if(res.data.code === '200'){
          let data = res.data.data.products
          let imageArray = []
          data.forEach((el, i) => {
            if(i < 24){
            imageArray.push({
              url:`https://image6.coupangcdn.com/image/${el.imageUrl}`,
              name: el.title
            })
          }})
          setImages(imageArray)
          console.log(imageArray)
        }
      })
  };

  const createZip = () => {
    // axios.get(images[0].url).then(res=>console.log(res))
    // let zip = new JSZip();
    // images.forEach((el, i) => {
    //   JSZipUtils.getBinaryContent(el, (err, data)=>{
    //     if(err){
    //       console.log(err)
    //     }else{
    //       zip.file('image'+(i+1)+".jpg", data, {
    //         binary: true
    //       });
    //       // deferred.resolve(zip)
    //     }
    //   })
    // })
    // zip.generateAsync({type:'blob'}).then(function(content) {
    //   FileSaver.saveAs(content, `${selected}.zip`);
    // });
    console.log(document.getElementsByTagName('img'))
  }

  return (
    <Row style={{height: '100%'}}>
      <Col span={6}>
      {category && category.length > 0 && <Tree
          onSelect={onSelect}
          treeData={category}
        />}
      </Col>
      <Col span={18}>
        <Row gutter={24}>
          {images && images.length > 0 &&
            images.map((el, i) => <Col span={4} key={i}><a style={{width: '100%'}} href={el.url} download={`${el.name}.jpg`}><img id={`image${i}`} style={{width: '100%'}} src={el.url}/></a></Col>)
          }
          {images && images.length > 0 && <Button block onClick={createZip} type="primary">다운로드</Button>}
        </Row>
      </Col>
    </Row>
  );
}

export default App;
