import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConnectService } from './connect.service';
import { DateService } from './date.service';
import { StorageService } from './storage.service';

interface Menu_Button {
  icon?: string,
  icon_type?: 'toggle' | 'link'
  text: string,
  permission?: () => boolean,
  routerLink?:string,
  open?:boolean,
  disabled?:boolean,
  children?: Array<Menu_Button>,
  badge?: () => number
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  openMenu = [];
  subMenusHidden:boolean = true;
  url:string = '';

  badge_standby:number = 0;
  badge_notify:number = 0;
  
  main:Array<Menu_Button> = [

    {icon: '../assets/img/icon_sign.svg', text: '결재', open: false, permission: () => { 
      return this.storage.user.data.user_type === 'SECL';
    },
    children: [
      {text: '미결함', routerLink: '/manage-approval-standby', badge: () => this.badge_standby, permission: () => true},
      {text: '기결함', routerLink: '/manage-approval-done', permission: () => true},
      {text: '통보함', routerLink: '/manage-approval-notice', badge:() => this.badge_notify, permission: () => true},
      {text: '결재선 설정', routerLink: '/manage-form-approval-total'},
      {text: '결재선 위임', routerLink: '/manage-approval-delegate', permission: () => true}
    ]},
    {icon: '../assets/img/icon_sign.svg', text: '결재', open: false, permission: () => {
      return this.storage.user.data.user_type === '협력업체';
      },
      children: [
        {text: '결재 작성', routerLink: '/manage-approval', permission: () => true},
        {text: '상신함', routerLink: '/manage-approval-request', permission: () => true},
        {text: '보류함', routerLink: '/manage-approval-hold', permission: () => true},
        {text: '통보함', routerLink: '/manage-approval-notice', badge:() => this.badge_notify, permission: () => true},
        {text: '결재선 지정', routerLink: '/manage-form-approval-personal', permission: () => true}
    ]},
    {
      icon: '../assets/img/icon_education.svg', text: '안전교육', open: false, permission: () => { return this.storage.user.data.user_type === 'SECL'; },
      children: [
        { text: '교육 개설', routerLink: '/safety-education-open-SECL', permission: () => true },
        { text: '교육 현황', routerLink: '/safety-education-open-state-SECL', permission: () => true },
        { text: '교육 결과 보고서', routerLink: '/safety-education-report-SECL', permission: () => true },
        { text: '특별직책 지정서', routerLink: '/safety-education-special-SECL', permission: () => true },
        { text: '기술인 교육 현황', permission: () => true },
        { text: '- 기술인별 교육 이력', routerLink: '/safety-education-record1', permission: () => true },
        { text: '- 정기 교육 이력', routerLink: '/safety-education-record2', permission: () => true },
        { text: '- 직종별 특별 교육 이력', routerLink: '/safety-education-record3', permission: () => true }
      ]
    },
    {
      icon: '../assets/img/icon_education.svg', text: '안전교육', open: false, permission: () => { return this.storage.user.data.user_type === '협력업체'; },
      children: [
        { text: 'SECL 교육', permission: () => true },
        { text: '- 교육 신청', routerLink: '/safety-education-secl-request-COOP', permission: () => true },
        { text: '- 교육 결과', routerLink: '/safety-education-secl-result-COOP', permission: () => true },
        { text: '정기/특별 교육', permission: () => true },
        { text: '- 교육 개설', routerLink: '/safety-education-open-COOP', permission: () => true },
        { text: '- 교육 결과', routerLink: '/safety-education-result-COOP', permission: () => true },
        { text: '특별직책 지정 신청', permission: () => true },
        { text: '- 관리감독자', routerLink: '/safety-education-special1-COOP', permission: () => true },
        { text: '- 작업지휘자', routerLink: '/safety-education-special2-COOP', permission: () => true },
        { text: '- 안전감시자', routerLink: '/safety-education-special3-COOP', permission: () => true },
        { text: '기술인 교육 현황', permission: () => true },
        { text: '- 기술인별 교육 이력', routerLink: '/safety-education-record1', permission: () => true },
        { text: '- 정기 교육 이력', routerLink: '/safety-education-record2', permission: () => true },
        { text: '- 직종별 특별 교육 이력', routerLink: '/safety-education-record3', permission: () => true },
        ]
   },
     
    // {icon: '../assets/img/icon_spcm.svg', text: 'S-PCM', open: false, permission: () =>
    // this.storage.user.data.user_type=='SECL' || this.storage.user.data.user_type=='협력업체'
    // ,
    // children: [
    //   { text: 'S-PCM 회의록', routerLink: '/home-secl'}
    // ]},
    // {icon: '../assets/img/icon_equipment.svg', text: '중장비', open: false, permission: ()=>
    //   this.storage.user.data.user_type == 'SECL'
    //   ,
    // {icon: '../assets/img/icon_spcm.svg', text: 'S-PCM', open: false, 
    // children: [
    //   { text: 'S-PCM 회의록', routerLink: '/home-secl'}
    // ]},
    // {icon: '../assets/img/icon_equipment.svg', text: '중장비', open: false, 
    //   children: [
    //     { text: '차량하역계 계획서', routerLink: '/home-secl'},
    //     { text: '중점 위험 작업허가서', routerLink: '/home-secl'},
    //     { text: '추가 작업허가서', routerLink: '/home-secl'}
    // ]},
    {icon: '../assets/img/icon_allow.svg', text: '작업허가서', open: false, permission: () => 
      this.storage.user.data.user_type === 'SECL' || this.storage.user.data.user_type === '협력업체'
    ,
      children: [
        {text: '일반 작업허가서', routerLink: '/manage-work-permission', permission: () => true},
        {text: '중점 위험 작업허가서', routerLink: '/manage-work-ptw-sub-info-list', permission: () => true},
        {text: '조출/중식/연장/야간', routerLink: '/manage-permission-worktime', permission: () => true}
    ]},
    {icon: '../assets/img/icon_danger.svg', text: '위험성평가', open:false, permission: () => 
    this.storage.user.data.user_type === 'SECL' || this.storage.user.data.user_type === '협력업체'
    ,
      children: [
        {text: '최초/정기 위험성평가 관리', routerLink: '/home-secl', permission: () => true},
        {text: '수시 위험성평가 관리', routerLink: '/home-secl', permission: () => true}
      ]},
    // {icon: '../assets/img/icon_tbm.svg', text: 'TBM', open: false, 
    // children: [
    //   { text: 'TBM 실시 현황', routerLink: '/tbm-pc-statuslist'},
    //   { text: 'TBM 리더 변경', routerLink: '/tbm-pc-leader'},
    //   { text: '안전교육 자료 조회', routerLink: '/tbm-safety-education'},
    //   { text: '자료 수정 건의', routerLink: '/tbm-safety-education-propose'}
    // ]},
    
    // {icon: '../assets/img/icon_danger_section.svg', text: '위험구간', open: false, permission: () => true,
    // children: [
    //   {text: '출입내역 조회', routerLink: '/manage-partner'},
    //   {text: '비인가자 접근이력 조회', routerLink: '/manage-client'},
    //   {text: '위험구간 점검 이력', routerLink: '/manage-project'},
    //   {text: '위험구간 부적합 관리', routerLink: '/manage-area'},
    //   {text: '위험구간 점검항목 관리', routerLink: '/manage-secl-standard'},
    //   {text: '점검표 관리', routerLink: '/manage-partner-standard'}
    // ]},
    // {icon: '../assets/img/icon_before_ing_after.svg', text: '전중후', open: false, 
    // children: [
    //   { text: '전중후', routerLink: '/home-secl'}
    // ]},
    // {icon: '../assets/img/icon_notice.svg', text: '공지사항', routerLink: '/notice', permission: () => true},
    // {icon: '../assets/img/icon_sign.svg', text: '결재', open: false, permission: () => {
    //   return this.storage.user.data.user_type === '협력업체';
    //   },
    //   children: [
    //     { text: '차량하역계 계획서', routerLink: '/home-secl'},
    //     { text: '중점 위험 작업허가서', routerLink: '/home-secl'},
    //     { text: '추가 작업허가서', routerLink: '/home-secl'}
    // ]},

    // {icon: '../assets/img/icon_tbm.svg', text: 'TBM', open: false, 
    // children: [
    //   { text: 'TBM 실시 현황', routerLink: '/tbm-pc-statuslist'},
    //   { text: 'TBM 리더 변경', routerLink: '/tbm-pc-leader'},
    //   { text: '안전교육 자료 조회', routerLink: '/tbm-safety-education'},
    //   { text: '자료 수정 건의', routerLink: '/tbm-safety-education-propose'}
    // ]},
    
    // {icon: '../assets/img/icon_danger_section.svg', text: '위험구간', open: false, permission: () => true,
    // children: [
    //   {text: '출입내역 조회', routerLink: '/manage-partner'},
    //   {text: '비인가자 접근이력 조회', routerLink: '/manage-client'},
    //   {text: '위험구간 점검 이력', routerLink: '/manage-project'},
    //   {text: '위험구간 부적합 관리', routerLink: '/manage-area'},
    //   {text: '위험구간 점검항목 관리', routerLink: '/manage-secl-standard'},
    //   {text: '점검표 관리', routerLink: '/manage-partner-standard'}
    // ]},
    // {icon: '../assets/img/icon_before_ing_after.svg', text: '전중후', open: false, 
    // children: [
    //   { text: '전중후', routerLink: '/home-secl'}
    // ]},

    // {icon: '../assets/img/icon_dri.svg', text: 'DRI', open: false, 
    // children: [
    //   { text: 'DRI', routerLink: '/home-secl'}
    // ]},
    {icon: '../assets/img/icon_board.svg', text: 'Dashboard', routerLink: '/dashboard', permission: () => true},
    {icon: '../assets/img/icon_notice.svg', text: '공지사항', routerLink: '/notice', permission: () => true}

  ]


  //--------------------전체매뉴--------------------
  //--------------------전체매뉴--------------------

  all:Array<Menu_Button> = [
    // {icon: '../assets/img/icon_board.svg', text: 'Dashbord', routerLink: '/dashboard', permission: () => true},
    {icon: '../assets/img/icon_sign.svg', text: '결재', open: false, permission: () => {
      return this.storage.user.data.user_type === '협력업체';
    },
    children: [
      {text: '결재 작성', icon_type: 'link', routerLink: '/manage-approval', permission: () => true},
      {text: '상신함', icon_type: 'link', routerLink: '/manage-approval-request', permission: () => true},
      {text: '보류함', icon_type: 'link', routerLink: '/manage-approval-hold', permission: () => true},
      {text: '통보함', icon_type: 'link', routerLink: '/manage-approval-notice', permission: () => true},
      {text: '결재선 지정', icon_type: 'link', routerLink: '/manage-form-approval-personal', permission: () => true}
    ]},
    {icon: '../assets/img/icon_sign.svg', text: '결재', open: false, permission: () => { 
      return this.storage.user.data.user_type === 'SECL';
    },
    children: [
      {text: '미결함', icon_type: 'link', routerLink: '/manage-approval-standby', permission: () => true},
      {text: '기결함', icon_type: 'link', routerLink: '/manage-approval-done', permission: () => true},
      {text: '통보함', icon_type: 'link', routerLink: '/manage-approval-notice', permission: () => true},
      {text: '결재선 관리', open: false ,icon_type:'toggle',
        children:[
          { text: '결제선 설정', routerLink: '/manage-form-approval-total'},
          { text: '결제선 위임', routerLink: '/manage-form-approval-total'}
        ]
       }
    ]},
    {icon: '../assets/img/icon_allow.svg', text: '작업허가서', open: false, 
    children: [
      { text: '일반 작업허가서', routerLink: '/manage-work-permission', icon_type: 'link'},
      { text: '중점 위험 작업허가서', routerLink: '/manage-work-ptw-sub-info-list', icon_type: 'link'},
      { text: '조출/중식/연장/야간', routerLink: '/manage-permission-worktime', icon_type: 'link'}
    ]},
    {icon: '../assets/img/icon_danger.svg', text: '위험성평가', open:false, permission: () => 
    this.storage.user.data.user_type === 'SECL' || this.storage.user.data.user_type === '협력업체'
   ,
     children: [
       {text: '최초/정기 위험성평가 관리', routerLink: '/home-secl', permission: () => true , icon_type:'link'},
       // {text: '정기 위험성평가', routerLink: '/home-secl', permission: () => true},
       {text: '수시 위험성평가 관리', routerLink: '/home-secl', permission: () => true, icon_type:'link'}
     ]},
     {icon: '../assets/img/icon_spcm.svg', text: 'S-PCM', open: false, permission: () => 
      this.storage.user.data.user_type==='SECL' || this.storage.user.data.user_type==='협력업체'
      ,
      children: [
        { text: 'S-PCM 관리', routerLink: '/home-secl', icon_type: 'link'}
    ]},
    {icon: '../assets/img/icon_equipment.svg', text: '중장비', open: false, permission: () =>
      this.storage.user.data.user_type==='SECL'
      ,
    children: [
      { text: '중장비 정보', routerLink: '/home-secl', icon_type: 'link'},
      { text: '중장비 점검', open:false ,icon_type: 'toggle',
        children: [
          { text: '일일 점검이력', routerLink: '/home-secl', icon_type: 'link'},
          { text: '정기 정검이력', routerLink: '/home-secl', icon_type: 'link'},
          { text: '부적합 관리', routerLink: '/home-secl', icon_type: 'link'}
        ]}
      ,
      { text: '중장비 작업계획서', routerLink: '/home-secl', icon_type: 'link'},
      { text: '중장비 운영실적', routerLink: '/home-secl', icon_type: 'link'},
      { text: '중장비 점검표 관리', routerLink: '/home-secl', icon_type: 'link'}
    ]},
    {icon: '../assets/img/icon_equipment.svg', text: '중장비', open: false, permission: () =>
    this.storage.user.data.user_type==='협력업체'
    ,
  children: [
    { text: '중장비 정보', routerLink: '/home-secl', icon_type: 'link'},
    { text: '중장비 점검', open:false ,icon_type: 'toggle',
      children: [
        { text: '일일 점검이력', routerLink: '/home-secl'},
        { text: '부적합 관리', routerLink: '/home-secl'}
      ]}
    ,
    { text: '중장비 작업계획서', routerLink: '/home-secl', icon_type: 'link'}
  ]},

    {icon: '../assets/img/icon_dri.svg', text: 'DRI', routerLink:'/home-secl'},

    {icon: '../assets/img/icon_before_ing_after.svg', text: '전중후', open: false, permission: () =>
    this.storage.user.data.user_type==='SECL'
    , 
    children: [
      { text: '전중후 점검', open:false , icon_type: 'toggle',
        children:[
          { text: '점검이력', routerLink: '/home-secl'}
        ]}
      ,
      { text: '위험작업 점검', routerLink: '/home-secl', icon_type: 'link'},
      { text: '점검표 관리', open:false , icon_type: 'toggle',
        children:[
          { text: '점검표등록', routerLink: '/home-secl', icon_type: 'link'},
          { text: '점검 항목관리', routerLink: '/home-secl', icon_type: 'link'}
        ]
    }
    ]},
    {icon: '../assets/img/icon_before_ing_after.svg', text: '전중후', open: false, permission: () =>
    this.storage.user.data.user_type==='협력업체'
    , 
    children: [
      { text: '전중후 점검', open:false , icon_type: 'toggle',
        children:[
          { text: '점검이력', routerLink: '/home-secl'},
        ]}
      ,
      { text: '위험작업 점검', routerLink: '/home-secl', icon_type: 'link'}
    ]},
    {icon: '../assets/img/icon_education.svg', text: '위험구간', open: false, permission: () =>
     this.storage.user.data.user_type==='SECL'
     ,
    children: [
      {text: '위험구간 점검', open:false, icon_type: 'toggle', 
      children: [
        {text: '점검 이력', routerLink: '/manage-project'},
        {text: '부적합 관리', routerLink: '/manage-area'},
      ]},
      {text: '위험구간 출입/접근', open:false, icon_type: 'toggle', 
      children: [
        {text: '인가자 출입내역', routerLink: '/manage-partner'},
        {text: '비인가자 접근내역', routerLink: '/manage-client'}
      ]},
      { text: '위험구간 조회', routerLink: '/home-secl', icon_type: 'link'},
      { text: '위험구간 점검표', open:false , icon_type: 'toggle', 
      children: [
        {text: '점검표 관리', routerLink: '/manage-partner-standard'},
        {text: '점검 항목 정리', routerLink: '/manage-secl-standard'}
      ]}
    ]},
    {icon: '../assets/img/icon_danger_section.svg', text: '위험구간', open: false, permission: () =>
    this.storage.user.data.user_type==='협력업체'
    ,
   children: [
     {text: '위험구간 점검', open:false, icon_type: 'toggle', 
     children: [
       {text: '점검 이력', routerLink: '/manage-project'},
       {text: '부적합 관리', routerLink: '/manage-area'},
     ]},
     {text: '위험구간 출입/접근',open:false, icon_type: 'toggle', 
     children: [
       {text: '인가자 출입내역', routerLink: '/manage-partner'},
       {text: '비인가자 접근내역', routerLink: '/manage-client'}
     ]},
   ]},
    {icon: '../assets/img/icon_before_ing_after.svg', text: '작업실적', open: false, permission: () =>
    this.storage.user.data.user_type==='SECL'
    ,
    children: [
      { text: '실적 TASK 관리', routerLink: '/home-secl', icon_type: 'link'},
      { text: '협력사 물량 계획', routerLink: '/home-secl' , icon_type: 'link'},
      { text: '협력사 PO 관리', routerLink: '/home-secl', icon_type: 'link'},
      { text: '작업 별 실적', routerLink: '/home-secl', icon_type: 'link'},
      { text: '물량 실적 조회', open:false , icon_type: 'toggle',
      children:[
        { text: '물량조회', routerLink: '/home-secl', icon_type: 'link'},
      ]
    },
      { text: '인력 실적 조회', open:false , icon_type: 'toggle',
      children:[
        { text: '인력조회', routerLink: '/home-secl', icon_type: 'link'},
      ]
    },
      { text: '장비 실적 조회', open:false , icon_type: 'toggle',
      children:[
        { text: '장비조회', routerLink: '/home-secl', icon_type: 'link'},
      ]
    },
      { text: '기상조회', routerLink: '/home-secl', icon_type: 'link'}
    ]},
    {icon: '../assets/img/icon_before_ing_after.svg', text: '작업실적', open: false, permission: () =>
    this.storage.user.data.user_type==='협력업체'
    ,
    children: [
      { text: '실적 TASK 관리', routerLink: '/home-secl', icon_type: 'link'},
      { text: '협력사 PO 관리', routerLink: '/home-secl', icon_type: 'link'},
      { text: '협려사 물량 계획', routerLink: '/home-secl' , icon_type: 'link'},
      { text: '작업 별 실적', routerLink: '/home-secl', icon_type: 'link'}
    ]},

    {icon: '../assets/img/icon_education.svg', text: '안전교육', open: false, permission: () =>
    this.storage.user.data.user_type==='SECL'
    ,
    children: [
      { text: '교육 개설', routerLink: '/safety-education-open-SECL', icon_type: 'link'},
      { text: '교육 현황', routerLink: '/safety-education-open-state-SECL', icon_type: 'link'},
      { text: '교육 결과 보고서', routerLink: '/safety-education-report-SECL', icon_type: 'link'},
      { text: '특별직책지정서', routerLink: '/safety-education-special-SECL', icon_type: 'link'},
      { text: '기술인 교육현황',open:false, icon_type: 'toggle', 
      children: [
        { text: '기술인별 교육이력', routerLink: '/safety-education-record1'},
        { text: '신규/정기 교육이력', routerLink: '/safety-education-record2'},
        { text: '직종별 특별교육이력', routerLink: '/safety-education-record3'}
      ]},
    ]},
    {icon: '../assets/img/icon_education.svg', text: '안전교육', open: false, permission: () =>
    this.storage.user.data.user_type==='협력업체'
    ,
    children: [
      { text: 'SECL 교육',open:false, icon_type: 'toggle',
      children:[
        {text:'교육신청',routerLink:'/safety-education-secl-request-COOP'},
        {text:'교육결과',routerLink:'/safety-education-secl-result-COOP'}
      ]
    },
      { text: '협력사 교육',open:false, icon_type: 'toggle',
      children:[
        {text:'교육개설',routerLink:'/safety-education-open-COOP'},
        {text:'교육결과',routerLink:'/safety-education-result-COOP'}
      ]
    },
      { text: '특별직책지정서',open:false, icon_type: 'toggle',
      children:[
        {text:'관리감독자',routerLink:'/safety-education-special1-COOP'},
        {text:'작업지휘자',routerLink:'/safety-education-special2-COOP'},
        {text:'안전감시자',routerLink:'/safety-education-special3-COOP'}
      ]
    },
      { text: '기술인 교육현황',open:false, icon_type: 'toggle', 
      children: [
        { text: '기술인별 교육이력', routerLink: '/safety-education-record1'},
        { text: '신규/정기 교육이력', routerLink: '/safety-education-record2'},
        { text: '직종별 특별교육이력', routerLink: '/safety-education-record3'}
      ]}     
    ]},

    {icon: '../assets/img/icon_tbm.svg', text: 'TBM', open: false, permission: () =>
     this.storage.user.data.user_type==='SECL'
    ,
    children: [
      { text: 'TBM 실시 현황', routerLink: '/tbm-pc-statuslist', icon_type: 'link'},
      { text: 'TBM 리더 변경', routerLink: '/tbm-pc-leader', icon_type: 'link'},
      { text: '안전교육 자료 관리', open:false , icon_type: 'toggle',
        children:[
            { text: '안전교육 자료', routerLink: '/tbm-safety-education', icon_type: 'link'},
            { text: '자료 수정 건의', routerLink: '/tbm-safety-education-propose', icon_type: 'link'}
        ]}
    ]},

    {icon: '../assets/img/icon_tbm.svg', text: 'TBM', open: false, permission: () =>
    this.storage.user.data.user_type==='협력업체'
    ,
    children: [
      { text: 'TBM 실시 현황', routerLink: '/tbm-pc-statuslist', icon_type: 'link'},
      { text: 'TBM 리더 변경', routerLink: '/tbm-pc-leader', icon_type: 'link'}
    ]},

    {icon: '../assets/img/icon_people_management.svg', text: '회원관리', open: false, permission: () => true,
    children: [
      {text: '신규기술인 등록', routerLink: '/manage-worker-new', icon_type: 'link', permission: () => {
        return this.storage.user.data.user_type === '협력업체';
    }},
      {text: '회원정보조회', open: false, icon_type: 'toggle', permission: () => true, 
      children: [
        { text: '기술인정보', routerLink: '/manage-worker' },
        { text: '관리자정보', routerLink: '/manage-admin' }
      ]},
      {text: '출입/가입 승인', icon_type: 'toggle', permission: () => {
        return this.storage.user.data.user_type === 'SECL' || this.storage.user.data.user_type === '협력업체';
      },
      children: [
        { text: '기술인 출입승인', routerLink: '/manage-worker-accept', permission: () => {
          return this.storage.user.data.user_type === 'SECL';
        }},
        { text: '관리자 가입승인', routerLink: '/manage-admin-accept', permission: () => {
          return this.storage.user.data.user_type === 'SECL' || this.storage.user.data.user_type === '협력업체';
        }}
      ]},
    ]},
    // {icon: '../assets/img/icon_board.svg', text: '대시보드', open: false, 
    // children: [
    //   { text: '작업현황', routerLink: '/home-secl', icon_type: 'link'},
    //   { text: '작업실적조회', routerLink: '/home-secl', icon_type: 'link'}
    // ]},
    {icon: '../assets/img/icon_board.svg', text: 'Dashboard', routerLink: '/dashboard', permission: () => true},
    {icon: '../assets/img/icon_notice.svg', text: '공지사항', routerLink: '/notice', permission: () => true},
    {icon: '../assets/img/icon_notice_box.svg', text: '알림함', routerLink: '/alarm', permission: () => true},
    // {icon: '../assets/img/icon_inout.svg', text: '입출문', open: false, 
    // children: [
      //   { text: '입출문 이력 관리', routerLink: '/home-secl', icon_type: 'link'}
      // ]},
      
      {icon: '../assets/img/icon_iot_device.svg', text: 'IoT 디바이스', open: false, permission: () =>
      this.storage.user.data.user_type === 'SECL' || this.storage.user.data.user_type === '협력업체'
      ,
      children: [
        { text: '시리얼 NO 등록', routerLink: '/home-secl', icon_type: 'link'},
        { text: '개인 IoT  디바이스', routerLink: '/home-secl', icon_type: 'link'},
        { text: '장비 IoT  디바이스', routerLink: '/home-secl', icon_type: 'link'},
        { text: '장소 IoT  디바이스', routerLink: '/home-secl', icon_type: 'link'}
      ]},
      {icon: '../assets/img/icon_system_management.svg', text: '시스템관리', open: false, permission: () => true,
      children: [
        {text: '회사정보 관리', icon_type: 'toggle',
        children: [
          { text: '협력사 등록', routerLink: '/manage-partner', permission: () => this.storage.user.data.user_type === 'SECL'},
          { text: '발주처 및 감리 등록', routerLink: '/manage-client', permission: () => this.storage.user.data.user_type === 'SECL'},
          { text: '협력사 PO 관리', routerLink: '/manage-po'}
        ]},
        // {text: '안전교육 관리자료', routerLink: '/manage-work-content', icon_type: 'link', permission: () => this.storage.user.data.user_type === 'SECL'},
        {text: '프로젝트 관리', icon_type: 'toggle', permission: () => this.storage.user.data.user_type === 'SECL',
        children: [
          { text: '프로젝트 등록', routerLink: '/manage-project'},
          { text: '공사 등록', routerLink: '/manage-construct'},
          { text: '작업장소 등록', routerLink: '/manage-area'},
          { text: '도면 등록', routerLink: '/home-secl'},
          { text: '위험구간 등록', routerLink: '/home-secl'},
          { text: '작업시간공수 설정', routerLink: '/manage-time'},
        ]},
        {text: '공종 및 Task 관리', routerLink: '/manage-construct-activity-task', icon_type: 'link', permission: () => this.storage.user.data.user_type === 'SECL'},
        {text: '안전교육 자료관리', routerLink: '/manage-work-content', icon_type: 'link', permission: () => this.storage.user.data.user_type === 'SECL'}, // manage-education-document
        {text: '화기/인화성작업 관리', icon_type: 'toggle', permission: () => this.storage.user.data.user_type === 'SECL',
        children: [
          { text: '화기/인화성 작업 등록', routerLink: '/manage-fire'},
          { text: '인화성물질 등록', routerLink: '/manage-flammable'}
        ]},
        /* {text: '회원 기준 관리', icon_type: 'toggle', permission: () => false,
        children: [
          { text: 'SECL 회원 기준 정보', routerLink: '/manage-secl-standard'},
          { text: '협력사 회원 기준 정보', routerLink: '/manage-partner-standard'}
        ]} */
      ]},
    

  ]


  constructor(
    private storage: StorageService,
    private router: Router,
    private connect: ConnectService,
    private date: DateService
    ) {
    this.router.events.subscribe(async(event) => {
      if(event instanceof NavigationEnd) {
        console.log(event.urlAfterRedirects);
        if(event.urlAfterRedirects) {
          this.url = event.urlAfterRedirects.replace('/', '');
          this.getApprovalCountAll();
        }
      }
    });
  }

  async getApprovalCountAll() {
    //통보함
    const res_notify = await this.geApprovalCountNotify();
    console.log('asdfasdfads', res_notify);
    this.badge_notify = res_notify ? res_notify.length : 0;
    //미결함
    const res_pending = await this.geApprovalCountStandby();
    console.log('결재선 카운트 가져오기', res_notify);
    this.badge_standby = res_pending ? res_pending.length : 0;
  }
  async geApprovalCountNotify() {
    const res = await this.connect.run('one', 'Get_ApprovalList_Notify', {
      project_id: this.storage.user.data.project_id,
      project_code: this.storage.user.data.project_code,
      project_name: this.storage.user.data.project_name,
      start_date: this.date.today({month: -1}),
      end_date: this.date.today(),
      approval_module_id: 4,
      approval_format_name: '',
      company_name: '',
      user_name: '',
      approval_progress: '전체',
      read_state: false
    });
    switch(res.code) {
      case 0:
        return res.data.json_data;
      default:
        console.error('결재선 카운트 가져오기 실패', res);
        break;
    }
  }
  async geApprovalCountStandby() {
    const res = await this.connect.run('one', 'Get_ApprovalList_Pending', {
      project_id: this.storage.user.data.project_id,
      project_code: this.storage.user.data.project_code,
      project_name: this.storage.user.data.project_name,
      start_date: this.date.today({month: -1}),
      end_date: this.date.today(),
      approval_module_id: 4,
      approval_format_name: '',
      company_name: '',
      user_name: '',
      approval_progress: '전체',
      read_state: '전체'
    });
    switch(res.code) {
      case 0:
        return res.data.json_data;
      default:
        console.error('결재선 카운트 가져오기 실패', res);
        break;
    }
  }


  calcMaxHeight(mainMenu, children) {
    let one = mainMenu;
    let two = children.length;
    let three = 0;
    children.map(x => {
      if(x.children) three += x.children.length;
    });
    return (one * 48) + (two * 42) + (three * 42) + 'px';
  }
  toggleMenu(item:Menu_Button) {
    this.main.map(item1 => {
      const isSelected = this.toggleMenuItem(item1, item);
      if(isSelected) this.subMenusHidden = true;
    });
    this.all.map(item1 => {
      const isSelected = this.toggleMenuItem(item1, item);
      if(isSelected) this.subMenusHidden = false;
    });
  }
  toggleMenuItem(item1:Menu_Button, item:Menu_Button) {
    let isSelected:boolean = false;
    const list:Menu_Button[] = [];
    list.push(item1);
    if(item1.children) {
      item1.children.map(item2 => {
        list.push(item2);
        if(item2.children) {
          item2.children.map(item3 => {
            list.push(item3);
          });
        }
      });
    }
    const index = list.indexOf(item);
    if(index > -1 && (item1.permission ? item1.permission() : true)) {
      item1.open = true;
      isSelected = true;
      if(item1.children) {
        item1.children.map(x => {
          if(x === item) {
            x.open = true;
            isSelected = true;
          } else  {
            x.open = false;
          }
          if(x.children) {
            const child_child = x.children.find(y => y === item);
            if(child_child) {
              x.open = true;
              isSelected = true;
            }
          }
        });
      }
    } else {
      item1.open = false;
      if(item1.children) item1.children.map(x => x.open = false);
    }
    return isSelected;
  }
}
