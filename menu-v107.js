/* Version 107: menu cleanup and round actions */
(function(){
  const priorShowAppMenu=window.showAppMenu;
  if(typeof priorShowAppMenu!=='function')return;

  window.startNewRoundFromMenu=function(){
    const active=!!(window.s?.sharedRoundId&&!window.s?.done);
    if(active&&!confirm('Start a new round? Your current round will remain available in Previous Matches.'))return;
    closeRoundQuickMenu();
    start();
  };

  window.finishRoundFromMenu=function(){
    closeRoundQuickMenu();
    if(!window.s?.sharedRoundId)return;
    if(window.s?.createdBy!==window.currentUser?.id){
      alert('Only the golfer who created this round can finish it for everyone.');
      return;
    }
    setRoundStatus('complete');
  };

  window.showAppMenu=function(){
    priorShowAppMenu();
    const menu=document.querySelector('.app-side-menu');
    if(!menu)return;

    const buttons=[...menu.querySelectorAll(':scope > button')];
    const clubsButton=buttons.find(button=>button.getAttribute('onclick')?.includes('openClubs'));
    const manageButton=buttons.find(button=>button.getAttribute('onclick')?.includes('openRoundManagement'));
    clubsButton?.remove();
    manageButton?.remove();

    const refreshed=[...menu.querySelectorAll(':scope > button')];
    const coursesButton=refreshed.find(button=>button.getAttribute('onclick')?.includes('openCoursesFromNav'));
    const startButton=refreshed.find(button=>button.classList.contains('menu-start-round')||button.getAttribute('onclick')?.includes('start()'));
    const languageButton=refreshed.find(button=>button.getAttribute('onclick')?.includes('showLanguageMenu'));

    if(coursesButton&&window.appLanguage==='en'){
      const icon=coursesButton.querySelector(':scope > span');
      coursesButton.innerHTML='';
      if(icon)coursesButton.appendChild(icon);
      coursesButton.appendChild(document.createTextNode(window.adminRole==='super_admin'?'Course / Players':'Courses'));
    }

    if(startButton){
      startButton.setAttribute('onclick','startNewRoundFromMenu()');
    }

    if(coursesButton&&window.s?.sharedRoundId&&!window.s?.done){
      const finish=document.createElement('button');
      finish.className='menu-finish-round';
      finish.setAttribute('onclick','finishRoundFromMenu()');
      finish.innerHTML='<span>✓</span>Finish Round';
      coursesButton.insertAdjacentElement('afterend',finish);
    }

    if(languageButton&&window.currentUser){
      const history=document.createElement('button');
      history.className='menu-previous-matches';
      history.setAttribute('onclick',"closeRoundQuickMenu();openHistory()");
      history.innerHTML='<span>↶</span>Previous Matches';
      languageButton.insertAdjacentElement('beforebegin',history);
    }
  };
})();
