import React from 'react';
import { Table, Input, Row, Col, List, Alert } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const { Search } = Input;

const App = () => {
  const [tableInfo, setTableInfo] = React.useState([])
  const [mapInfo, setMapInfo] = React.useState(null)
  const [lastSearch, setLastSearch] = React.useState([])
  const [messageNotFound, setMessageNotFound] = React.useState(null)
  React.useEffect(() => {
    if(localStorage.getItem('lastSearch') !== null && localStorage.getItem('lastSearch') !== '')
      setLastSearch(localStorage.getItem('lastSearch').split(','))
  },[])

  const handleSearch = value => {
    if(value !== '')
      fetch(`http://api.openweathermap.org/data/2.5/weather?q=${value}&appid=62de07b563bcffdbacd152cebefa7520`)
        .then(res => res.json())
        .then(forecast => {
          if(forecast.cod === "404") {
            setMessageNotFound(forecast.message)
            setTableInfo([])
            setMapInfo(null)
          } else {
            setMessageNotFound(null)
            setTableInfo(forecast.main)
            setMapInfo(forecast.coord)
            if(!lastSearch.includes(value)) {
              if(lastSearch.length < 5) {
                setLastSearch([value, ...lastSearch])
                localStorage.setItem('lastSearch', [value, ...lastSearch].join(','));
              } else {
                lastSearch.pop()
                setLastSearch([value, ...lastSearch])
                localStorage.setItem('lastSearch', [value, ...lastSearch].join(','));
              }
            }
          }
        })
  }

  const removeFileItem = item => {
    const newLastSearch = [].concat(lastSearch.filter(element => element !== item))
    setLastSearch(newLastSearch)
    localStorage.setItem('lastSearch', newLastSearch.join(','));
  }
  const columns = [
    { title: 'Temperature', dataIndex: 'temp'  },
    { title: 'Pressure', dataIndex: 'pressure' },
    { title: 'Humidity', dataIndex: 'humidity' },
    { title: 'Max temperature', dataIndex: 'temp_max' },
    { title: 'Min temperature', dataIndex: 'temp_max'},
  ];

   const MyMapComponent = withScriptjs(withGoogleMap((props) =>
      <GoogleMap
        defaultZoom={8}
        defaultCenter = {
          {
            lat: mapInfo.lat,
            lng: mapInfo.lon
          }
        }
      >
        {
          props.isMarkerShown && < Marker position = {
            {
              lat: mapInfo.lat,
              lng: mapInfo.lon
            }
          }
          />
        }
      </GoogleMap>
    ))
    
  
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Search placeholder="search text" onSearch={value => handleSearch(value)} enterButton />
        </Col>
      </Row>
      
      { messageNotFound && 
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Alert message={messageNotFound} type="error" /> 
          </Col>
        </Row>
      }
      
      <Row>
        <Col span={14}>
          <Table columns={columns} dataSource={[tableInfo]} size="middle" pagination={false} />
        </Col>
        <Col span={8} offset={2}>
          <List
            size="small"
            header={<div>Last 5 Searches</div>}
            bordered
            dataSource={lastSearch}
            renderItem={item => <List.Item actions={[<DeleteTwoTone key="list-loadmore-edit" onClick={() => removeFileItem(item)} />]}><a onClick={() => handleSearch(item)}>{item}</a></List.Item>}
          />
        </Col>
      </Row>
      <Row>
        <Col span={14}>
          { mapInfo ?
            <div>
              <p className="text-uppercase font-weight-bold"> MAPA </p>
              <MyMapComponent
                isMarkerShown
                googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                loadingElement={<div style={{ height: `100%`, width: `50%` }} />}
                containerElement={<div style={{ height: `400px` }} />}
                mapElement={<div style={{ height: `100%`, width: `100%`, marginBottom: `60px`}} />}
              />
            </div>
            : ''
          }
        </Col>
      </Row>
    </>
  );
}

export default App;
