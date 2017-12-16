var canvas = document.getElementById('background');
var context = canvas.getContext('2d');
	
	var bgImg = new Image();
	var shuttle = new Image();
	var enemyship = new Image();
	var eB = new Image();
	var misi = new Image();
	
	var Life=100; //no of lives
	var x,y; //spaceship x,y
	var missiles = new Array();
	var nMissile=0;
	var shootOn=0; //added to avoid the user from firing without a break(to make a gap between each shot)
	
	var key =0; //pressed key
	
	var level = 1;
	var gameSpeed;
	
	var nEnemy;
	var Enemy = new Array(); //status,health,x,y
	var fireRate; //n per 200ms
	var eBullets= new Array();
	var enBullet=0;
	var bulletSpeed;
	var health;
	var damage;
	
	var LorR,TorB;
	var width=600,height;
	var backH;
	
	var t1,t2,t3,t4,t5,t6;
	window.addEventListener("keydown", EventKeyPress, false);
	
	var SShoot = new Audio('sounds/shoot.mp3');
	var SBack= new Audio('sounds/background.mp3');
	var SGameover = new Audio('sounds/gameover.mp3');
	var SBlast =new Audio('sounds/blast.mp3');
	
	function mainMenu()
	{
		height=window.innerHeight; //canvas height
		canvas.setAttribute('width', width);
		canvas.setAttribute('height',height);	
		
		 window.setTimeout(function(){ //wait  till images loaded
		var instructions = new Image();
		var title = new Image();
		instructions.src="images/mainmenu.png";
		title.src="images/title.gif";
		
		context.drawImage(title,(width-440)/2,25);
		context.drawImage(instructions,(width-480)/2,255);
		context.fillStyle = '#2C98DB';
		context.font = 'bold 30pt Arial';
		tx=context.measureText("Press space to continue");
		context.fillText("Press space to continue",(width-tx.width)/2,height/2 + 180);
		context.fillStyle = '#2C98DB';
		context.font = 'bold 30pt Arial';
		tx=context.measureText("Press space to continue");
		t6=setInterval(restart,10);
	},500);
		
		 }
	
	function initialize()
	{
		SBack.volume=0.6;
		SBack.loop=true;
		SBack.currentTime = 0;
		SBack.play();
		
		eB.src = 'images/b.png';
		misi.src = 'images/m.png';
		shuttle.src = 'images/shuttle.png';
		
		SetLevelData();
		backH =0; //bg img height
	
		//starting pos : center
		x=(width-shuttle.width)/2;
		y=height - shuttle.height;
		//
		
		t1=setInterval(gameplay,gameSpeed);
		t2=setInterval(StartFire,3000);
		t3=setInterval(moveEnemy,200);
		t4=setInterval(KeepFiring,50);
		t5=setInterval(shoot,800);
  }
	
	function gameplay() 
	{
	if (Life>0)
		{
			//Background Animation
			context.drawImage(bgImg, 0,backH);
			context.drawImage(bgImg, 0,-bgImg.height+backH);
			
			backH++;
		
      		if (backH> bgImg.height) {
				backH = 0;
      		}
			//
			
			
			//spaceship movement
			if (key==37)
			{
				x-=5; //l
			}
			else if (key==39)
			{
				x+=5; //r
			}
			else if (key==40)
			{
				y+=5; //u
			}
			else if (key==38)
			{
				y-=5; //d
			}
			else if (key==32)
			{
				shootOn=1; //space
			}
			
			key=0;
			
			
			
			if (x<0)
				{
					x=0;
				}
			else if (x>width-shuttle.width)
				{
					x=width-shuttle.width;
				}
			
			if (y<(height+shuttle.height)/2)
				{
					y=(height+shuttle.height)/2;
				}
			else if (y>height-shuttle.height)
				{
					y=height-shuttle.height;
				}
			//
			
			context.drawImage(shuttle, x,y);
			
		 	var count=0; // to count remaining no of enemy ships so that we can check if all enemy ships are destroyed
			for (var i = 0 ;i<nEnemy ; i++)
				{
					
					if (Enemy[i].alive==1)
						{
							count++;
							context.drawImage(enemyship,Enemy[i].x,Enemy[i].y);
						}
				}
			
			//check if all enemy ships are destroyed
			if(count==0)
				{
					level++;
					clear();
					context.fillStyle = '#2C98DB';
					context.font = 'bold 90pt Arial';
					var tx=context.measureText("LEVEL " +level);
					context.fillText("LEVEL " +level,(width-tx.width)/2,height/2);
					setTimeout(function(){ initialize();}, 2000); //sleep for 2seconds keeping the levelup text visible for 2seconds
				}
			else
				{
					context.fillStyle = 'red';
					context.font = '15pt Arial';
					context.fillText("Health: " + Life + "%",20,22);
					context.fillText("Level: " + level,width-100,22);
				}
			
			
			for (var i = 0 ;i<enBullet ; i++)
				{
					
					if (eBullets[i].alive==1)
						{
							context.drawImage(eB,eBullets[i].x,eBullets[i].y);
						}
				}
			
			for (var i = 0 ;i<nMissile ; i++)
				{
					
					if (missiles[i].alive==1)
						{
							context.drawImage(misi,missiles[i].x,missiles[i].y);
						}
				}
		}
			else
				{
					clear();
					context.fillStyle = '#E74C3C';
					context.font = 'bold 65pt Arial'; 
					var tx=context.measureText("GAME OVER");
					context.fillText("GAME OVER",(width-tx.width)/2,height/2);
					context.fillStyle = '#2C98DB';
					context.font = 'bold 20pt Arial';
					tx=context.measureText("Press space to continue");
					context.fillText("Press space to continue",(width-tx.width)/2,height/2 + 50);
					SBack.pause();
					SGameover.play();
					t6=setInterval(restart,10);
					
				}
			
    	}
	
	function restart()
	{
		if(key==32)
			{
				level=1;
				clear();
				clearInterval(t6);
				initialize();
			}
	}
	
	function moveEnemy()
	{		//choose left or right
			var temp1,temp2;
			if (LorR==0)
				{
					temp1 = 10;
				}
			else 
				{
					temp1 = -10;
				}
			
			if (Enemy[0].x - 10 < 0)
				{
					temp1 = 10;
					LorR=0; //enemy at the left border, so its turned to right
				}
			else if (Enemy[nEnemy-1].x + 10 > bgImg.width-enemyship.width)
				{
					temp1 = -10;
					LorR=1; //enemy at the right border, so its turned to left
				}
			//
			
			//choose Top or Bottom
			if (TorB==0)
				{
					temp2 = 10;
				}
			else 
				{
					temp2 = -10;
				}
			
			if (Enemy[0].y - 10 < 30)
				{
					temp2 = 10;
					TorB=0; //enemy at the upper border, so its turned down
				}
			else if (Enemy[nEnemy-1].y + 10 > (height+shuttle.height)/2 - enemyship.height)
				{
					temp2 = -10;
					TorB=1; //enemy at the lower border, so its turned up
				}
			//
			
			for (var i = 0 ;i<nEnemy ; i++)
				{
					Enemy[i].x += temp1;
					Enemy[i].y += temp2;
				}
		}
	
	function StartFire()
	{
			var temp=0;
			for (var i = 0 ;i<nEnemy ; i++)
				{
					if (Enemy[i].alive==1)
						{
							if (temp<fireRate) //keep running the loop until it comes to fireRate
								{
									eBullets[enBullet] = {alive:1, x:Enemy[i].x, y:Enemy[i].y};
									enBullet++;
								}
							temp++;
						}
				}
			
		}
		
	function KeepFiring()
	{
			for (var i = 0 ;i<enBullet ; i++)
				{
					if (eBullets[i].alive==1)
						{
							eBullets[i].y+=bulletSpeed; //move bullet down
														
							if(eBullets[i].y>height) //check if it has passed the bottom border
								{
									eBullets[i].alive=0;
								}
							
							//check collision with spaceship
							if (eBullets[i].x > x && eBullets[i].x < x + shuttle.width)
								{
								if (eBullets[i].y > y &&  eBullets[i].y < (y+ shuttle.height) )
									{
									eBullets[i].alive=0;
									Life-=damage; //reduce no of lives
									}
								}
							
						}
				}	
			
				for (var i = 0 ;i<nMissile ; i++)
				{
					if (missiles[i].alive==1)
						{
							missiles[i].y-=5;
							
							if(missiles[i].y<30) //check if it has passed the top border
								{
									missiles[i].alive=0;
								}
							
							//check collision with enemyships
						for (var j = 0 ;j<nEnemy ; j++)
						{
					
							if (Enemy[j].alive==1)
								{
									if (missiles[i].x > Enemy[j].x && missiles[i].x < Enemy[j].x + enemyship.width)
									{
										if (missiles[i].y > Enemy[j].y &&  missiles[i].y < (Enemy[j].y+ enemyship.height) )
										{
											missiles[i].alive=0;
											Enemy[j].health-=25; //reduce the helath
											//check if its destroyed
											if (Enemy[j].health<1)
												{
													SBlast.play();
													Enemy[j].alive=0;
												}
										}
									}
								} 
						} 
						}
				}
		}
	
	function shoot()
	{
			if(shootOn==1)
				{
					SShoot.play();
					missiles[nMissile] = {alive:1, x:x+(shuttle.width-misi.width)/2, y:y};
					nMissile++;
					shootOn=0;
				}
		}
	
	function clear()
	{
		missiles = new Array();
		nMissile=0;
		shootOn=0;
		key =0;
		Enemy = new Array();
		eBullets= new Array();
		enBullet=0;
		clearInterval(t1);
		clearInterval(t2);
		clearInterval(t3);
		clearInterval(t4);
		clearInterval(t5);
		Life=100;
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	function EventKeyPress(e) {   key= e.keyCode;   };
	
	function SetLevelData()
	{
		if(level%5==0) //increase bulllet speed & fire rate, game speed every 5 levels
			{
				
				bulletSpeed+=1;
				if(fireRate<nEnemy)//no. enemys >= bullets fired at same time
					{
						fireRate+=1;
					}
				
				if(gameSpeed<1)
					{
					gameSpeed--;
					}
			}
		
		if(level%2==0) //increase no. enemys every 2 levels
			{
				if(nEnemy<12)
					{
						nEnemy+=2
					}
			}
		
		if (level==1)
			{
				bgImg.src = 'images/bg1.png';
				enemyship.src = 'images/enemy1.png';
				
				nEnemy=2;
				gameSpeed=10;
				fireRate=1;
				bulletSpeed=5;
				health=50;
				damage=5;
			}
		else //increase bullet damage & health, change bg image & enemy image every level
			{
				damage+=2;
				health+=(level*5);
			
				enemyship.src = 'images/enemy'+ (level%10) + '.png'; //10 images for enemy named as enemy0....enemy9
				bgImg.src = 'images/bg'+ (level%5) +'.png'; //5 images for background named as bg0....enemy4
			}
		
		
		 window.setTimeout(function(){ // added to delay so that enemy images are loaded. if not enemyship.height/width = 0
						   
		 //initial pos of enemy ships
			for (var i = 0 ;i<nEnemy ; i++)
				{
					var tempX=(enemyship.width*i)+(i*10),tempY=30,j;
					
					if (i>(nEnemy/2)-1) //second row
						{
						j=i-(nEnemy/2);
						tempY+=	enemyship.height+10;
						tempX=(enemyship.width*j)+(j*10);
						}
					
					Enemy[i]= {alive:1, health:health, x:tempX, y:tempY};
				
				}
						   
						   
		 },500);
		
	}
	