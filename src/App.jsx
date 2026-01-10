import axios from 'axios';
import './assets/style.css'
import { useState } from 'react'


const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function App() {
  const [formData, setFormData] = useState({
    username: 'lynn202400095@gmail.com',
    password: ''
  })
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();

  const handleInputChage = (e) => {
    const {name, value} = e.target;
    //console.log(name, value);
    setFormData((preData) => ({
      ...preData, [name]:value,
    }))
  }
  //處理登入
  const onSubmit = async(e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData)
      //console.log(response)
      //設定cookie
      const {token, expired}=response.data;
      document.cookie = `userToken=${token};expires=${new Date(expired)};`;
      //設定 Authorization Header
      axios.defaults.headers.common['Authorization'] = token;
      //設定畫面
      setIsAuth(true);
      getProducts();  //登入就會取得產品列表，故需呼叫getProducts
    } catch (error) {
      setIsAuth(false);
      alert(`登入失敗訊息:${error.response.data.error.message}`)
    }
  }
  //處理登入驗證
  const checkLogin = async() => {
    try {
      const response = await axios.post(`${API_BASE}/api/user/check`)
      //不用傳參數，須將取得cookie帶入
      const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userToken="))
      ?.split("=")[1];
      axios.defaults.headers.common['Authorization'] = token;
      console.log(response);
    } catch (error) {
      console.log(error);
      alert('登入失敗請確認帳密輸入是否正確',)
    }
  }
  const getProducts = async() => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`)
      setProducts(response.data.products)
    } catch (error) {
      console.log(error.response)
    }
  }
  const renderOriginPrice = (originPrice, price) => {
    if(originPrice === price) {
      return <span>{price}元</span>;
    }
    return (
      <>
        <p className="card-text text-secondary">
          <del>{originPrice}</del>
        </p>
        <span className='mx-1'>/</span>
        {price} 元        
      </>
    )
  }

  
  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1 className="mb-3">請先登入</h1>
          <form className="form-floating" onSubmit={(e)=>onSubmit(e)}> 
            <div className="form-floating mb-3">
              <input type="email"className="form-control" id="email" name="username" placeholder="name@example.com" value={formData.username} onChange={(e) => handleInputChage(e)}/>
              <label htmlFor="floatingInput">Email address</label>
            </div>
            <div className="form-floating">
              <input type="password" className="form-control" id="password" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChage(e)}/>
              <label htmlFor="floatingPassword">Password</label>
            </div>
            <button type="submit" className='btn btn-primary mt-3 w-100'>登入</button>        
          </form>
        </div>
      ) : (
        <div className="container">          
          <div className="row mt-5">           
            <div className="col-md-6">
              <button type="button" className='btn btn-warning mb-5' onClick={() => checkLogin()}>
                確認是否登入
              </button> 
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      {renderOriginPrice(tempProduct.origin_price, tempProduct.price)}
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.filter(url => url).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images m-1"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
                    
        </div>
      )}
    </>
  );
}

export default App
