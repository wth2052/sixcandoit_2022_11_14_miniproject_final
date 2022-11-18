        // 문서가 로딩될 시 읽어질 함수들
        //버킷리스트와 방명록 코멘트, 그리고 날씨 API함수 까지 읽어옴
        $(document).ready(function () {
            show_bucket();
            show_comment();
            showLocation();

        });
        <!-- 모달창 처리 시작 -->
        $('#myModal').on('shown.bs.modal', function () {
          $('#myInput').trigger('focus')
        })
        // <!-- 모달창 처리 끝-->//

        //버킷리스트 보여주는 함수
        function show_bucket(){
            $.ajax({
                type: "GET",
                url: "/bucket",
                data: {},
                success: function (response) {
                    let rows = response['buckets']
                    for (let i =0; i < rows.length; i++){
                        let bucket = rows[i]['bucket']
                        let num = rows[i]['num']
                        let done = rows[i]['done']
                        let temp_html = ``
                        if (done == 0){
                            temp_html = `
        <li>
            <h2>✅ ${bucket}</h2>
            <button onclick="done_bucket(${num})" type="button" class="btn btn-outline-primary">완료!</button>
        </li>`}else{
                            temp_html= `
        <li>
            <h2 class="done">✅ ${bucket}</h2>
        </li>`
                        }
                        $('#bucket-list').append(temp_html)
                    }
                }
            });
        }

        // 버킷 저장함수, 공백은 허용하지 않음.
        function save_bucket(){
            let bucket = $('#bucket').val()
                bucket = bucket.replaceAll(" ", '')
                    if (bucket == ""){
                        return alert("공백은 허용 되지 않습니다.")
                    }
            $.ajax({
                type: "POST",
                url: "/bucket",
                data: {bucket_receive:bucket},
                success: function (response) {


                    alert(response["msg"])
                    window.location.reload()
                }
            });
        }
        // 버킷 출력 함수
        function done_bucket(num){
            $.ajax({
                type: "POST",
                url: "/bucket/done",
                data: {num_receive:num},
                success: function (response) {
                    alert(response["msg"])
                    window.location.reload()
                }
            });
        }

        //발전사항 : 서울 API만 받아오던것이 사용자의 위치를 기반으로 위도와 경도를 받아온 후
        //          HTML에 위도와 경도(두번째 자리까지), 날짜 아이콘(날짜에 따라 변함), 위치(영어로 소재지 출력),
        //          현재 위치 온도(섭씨로 출력, 화씨는 소숫점 두번째 자리까지(화씨 출력하고싶은 경우 주석을 해제하여 사용), 섭씨는 첫번째 자리까지)
        //현재 위도 경도로 위치잡아주고 기반으로 다른 값 출력
            function showLocation(event) {
              var latitude = event.coords.latitude
              var longitude = event.coords.longitude
              document.querySelector("#latitude").textContent = Math.round(latitude *100) / 100
              document.querySelector("#longitude").textContent = Math.round(longitude *100) / 100

            //위도와 경도를 추가하여 weatherUrl이 바뀌므로 사용자의 지역에 따라 서로 다른 값 출력
            //위도와 경도에 따른 종속변수 #앞의 값에따라 변하는 변수들
              let apiKey = "c9094277ce42cae0392ac8222a2dd1f2"
              let weatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude
                            + "&lon=" + longitude
                            + "&appid=" + apiKey;
             //api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
                let options = { method: 'GET' }
              $.ajax(weatherUrl, options).then((response) => {
                  console.log(response)
                  let icon = response.weather[0].icon
                  let iconUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
                  let img = document.querySelector("#wicon")
                  //01이라고 명명한 이유 : index.html의 방명록 name id와 중복되어 01로 붙이게 되었음.
                  let name01 = response.name
                  img.src = iconUrl
                  document.querySelector("#temp").textContent =  /*"(" +*/ Math.round((response.main.temp - 273)*10) / 10 +"°C"/*+ ")"*/ //+ (response.main.temp)+"°F"  화씨까지 띄우기  // 현재 온도
                  document.querySelector("#name01").textContent = name01
                }).catch((error) => {
                  console.log(error)
                })
            }
            //위치정보를 불러올수 없을때에 대한 예외처리
            function showError(event) {
              alert("위치 정보를 얻을 수 없습니다.")
            }

            window.addEventListener('load', () => {
              if(window.navigator.geolocation) {
                 window.navigator.geolocation.getCurrentPosition(showLocation,showError)
              }
            })
        //방명록 저장 함수, 공백은 허용하지 않음
        function save_comment() {
            let name = $('#name').val()
            let comment = $('#comment').val()
                name = name.replaceAll(" ", '')

                if(name === '' || comment === ''){
                    return alert("공백은 허용되지 않습니다.")
                }

            $.ajax({
                type: "POST",
                url: "/member/guestbook",
                data: {'name_receive':name, 'comment_receive':comment},
                success: function (response) {
                    alert(response["msg"])
                    window.location.reload()
                }   
            });
        }

        //방명록 출력 함수
        function show_comment() {
            $('#comment-list').empty()
            $.ajax({
                type: "GET",
                url: "/member/guestbook",
                data: {},
                success: function (response) {
                    let rows = response['comments']
                    for (let i = 0; i < rows.length; i++) {
                        let name = rows[i]['name']
                        let comment = rows[i]['comment']
                        let id = rows[i]['_id']
                        let temp_html = `<div class="card">
                                            <div class="card-body">
                                                <blockquote class="blockquote mb-0">
                                                <footer class="blockquote-footer">${name}</footer>
                                                <p>${comment}</p>
                                                <!-- \` \` <- '' 차이??????-->
                                                <button onclick="update_member(\`${id}\`)" type="button" class="btn btn-dark">수정</button>
                                                <button onclick="delete_member(\`${id}\`)" type="button" class="btn btn-dark">삭제</button> 
                                                </blockquote>
                                            </div>
                                        </div>`
                        $('#comment-list').append(temp_html)
                    }
                }
            });
        }
        
        //수정 함수, 역시 몽고db의 objectID를 ${id}파라미터로 받아 처리함
        function update_member(id) {
            //alert(id) 정상처럼 받아오면 JS에는 문제가 없는것
            let name = $('#name').val()
            let comment = $('#comment').val()
                    $.ajax({
                type: "PUT",
                url: `/member/guestbook/${id}`,
                data: {
                    name_receive: name,
                    comment_receive: comment,
                },
                success: function (response) {
                    alert(response["msg"])
                    window.location.reload()
                }
            });
        }

        // 삭제 함수, 역시 몽고db의 objectID를 ${id}파라미터로 받아 처리함
        function delete_member(id) {
            $.ajax({
                type: "DELETE",
                url: `/member/guestbook/${id}`,
                data: {},
                success: function (response) {
                    alert(response["msg"])
                    window.location.reload()
                }
            });
        }
        // 실시간 시계 함수, 각 연월일,시분초를 출력하는 메소드로 구현하였음.
        function setClock(){
            var dateInfo = new Date();
            var hour = modifyNumber(dateInfo.getHours());
            var min = modifyNumber(dateInfo.getMinutes());
            var sec = modifyNumber(dateInfo.getSeconds());
            var year = dateInfo.getFullYear();
            var month = dateInfo.getMonth()+1; //monthIndex를 반환해주기 때문에 1을 더해준다.
            var date = dateInfo.getDate();
            document.getElementById("time").innerHTML = hour + ":" + min  + ":" + sec;
            document.getElementById("date").innerHTML = year + "년 " + month + "월 " + date + "일";
        }
        //시계 함수의 값이 10 미만일경우 0을 붙여 비교적 자연스럽게 출력한다. (안할시 4:2:10과 같은 형태로 출력됨)
        function modifyNumber(time){
            if(parseInt(time)<10){
                return "0"+ time;
            }
            else
                return time;
        }
            window.onload = function(){
                setClock();
                setInterval(setClock,1000); //1초마다 setClock 함수 실행
            }

        //clock
        // function getTime() {
        //     const date = new Date();
        //     //new Date()는 Date 객체를 불러옴, 이 함수를 인수 없이 호출하면 현재 날짜 및 시간이 저장된 date 객체가 반환된다.
        //
        //     clock.innerText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        // }
        // getTime()
        // setInterval(getTime, 1000);
    //Date 객체의 여러 메소드를 활용해, 현재 시간 값을 얻어올 수 있음. 이를 innerText로 화면에 표시한다.


        // 내가 작성한 시계 코드
        // const clock = document.getElementById("clock");
        // function getClock(){
        //   const date = new Date()
        //   const hour = String(date.getHours()).padStart(2,"0");
        //   const minutes = String(date.getMinutes()).padStart(2,"0");
        //   const second = String(date.getSeconds()).padStart(2,"0");//number이기 때문에 padStart X, string으로 변환해야함
        //   clock.innerText = `${hour}:${minutes}:${second}`;
        //   }
        // getClock();
        // setInterval(getClock, 1000);


