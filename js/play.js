	var canvas = document.getElementById('background');
	var context = canvas.getContext('2d');
	var width=600,height=650;

	var backgroundImage = new Image();
	var shuttleImage = new Image();
	var enemyShipImage = new Image();
	var bulletImage = new Image();
	var missileImage = new Image();
	var mainMenuImage = new Image();

	mainMenuImage.src = 'images/mainmenu.png';

	var bgHeight;
	var key;
	var gameSpeed;
	var level;
	
	var missiles;
	var missileIndex;
	var shootOn;
	var life;
	var x,y;

	var enemy;
	var nEnemy;
	var bullets;
	var bulletIndex;
	var fireRate;
	var bulletSpeed;
	var health;
	var damage;
	var direction_LR,direction_TB;

	var sound_SHOOTING = new Audio('sounds/shoot.mp3');
	var backgroundMusic= new Audio('sounds/background.mp3');
	var gameoverMusic = new Audio('sounds/gameover.mp3');
	var sound_BLAST =new Audio('sounds/blast.mp3');
	
	window.addEventListener("keydown", EventKeyPress, false);

	var timer_RESTART;
	var timer_GAMEPLAY;
	var timer_ENEMY;
	var timer_SHOOT;
	var timer_STARTSHOOTING;
	var timer_KEEPSHOOTING;

	function mainMenu()
	{
		canvas.setAttribute('width', width);
		canvas.setAttribute('height',height);
		context.fillStyle = '#2C98DB';
		context.font = 'bold 30pt Arial';
		tx=context.measureText("Press space to continue");
		context.fillText("Press space to continue",(width-tx.width)/2,height/2 + 180);
		context.drawImage(mainMenuImage,(width-mainMenuImage.width)/2,10)
		timer_RESTART=setInterval(restart,10);
	}

	function restart()
	{
		if(key==32)
			{
				level=1;
				clear();
				clearInterval(timer_RESTART);
				initialize();
			}
	}
	
	function clear()
	{
		missiles = new Array();
		missileIndex=0;
		shootOn=0;
		key =0;
		enemy = new Array();
		bullets= new Array();
		bulletIndex=0;
		life=100;
		clearInterval(timer_GAMEPLAY);
		clearInterval(timer_STARTSHOOTING);
		clearInterval(timer_ENEMY);
		clearInterval(timer_KEEPSHOOTING);
		clearInterval(timer_SHOOT);
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function initialize()
	{
		backgroundMusic.volume=0.6;
		backgroundMusic.loop=true;
		backgroundMusic.currentTime = 0;
		backgroundMusic.play();
		
		bulletImage.src = 'images/bullet.png';
		missileImage.src = 'images/missile.png';
		shuttleImage.src = 'images/shuttle.png';
		
		setLevelData();
		bgHeight =0; //bg img height
	
		//starting pos : center
		x=(width-shuttleImage.width)/2;
		y=height - shuttleImage.height;
		//
		
		timer_GAMEPLAY=setInterval(gameplay,gameSpeed);
		timer_STARTSHOOTING=setInterval(startShooting,3000);
		timer_ENEMY=setInterval(moveEnemy,200);
		timer_KEEPSHOOTING=setInterval(keepShooting,50);
		timer_SHOOT=setInterval(shoot,800);
  	}
	
	function gameplay() 
	{
	if (life>0)
		{
			//Background Animation
			context.drawImage(backgroundImage, 0,bgHeight);
			context.drawImage(backgroundImage, 0,-backgroundImage.height+bgHeight);
			
			bgHeight++;
		
      		if (bgHeight> backgroundImage.height) {
				bgHeight = 0;
      		}
			//
			
			
			//spaceship movement
			if (key==37) x-=5; //left arrow
			else if (key==39) x+=5; //right arrow
			else if (key==40) y+=5; //up arrow
			else if (key==38) y-=5; //down arrow
			else if (key==32) shootOn=1; //space bar
			
			key=0;
			
			if (x<0) x=0;
			else if (x>width-shuttleImage.width) x=width-shuttleImage.width;
			
			if (y<(height+shuttleImage.height)/2) y=(height+shuttleImage.height)/2;
			else if (y>height-shuttleImage.height) y=height-shuttleImage.height;
			
			
			context.drawImage(shuttleImage, x,y);
			
		 	var count=0; // to count remaining no of enemy ships so that we can check if all enemy ships are destroyed
			for (var i = 0 ;i<nEnemy ; i++)
				{
					if (enemy[i].alive==1)
						{
							count++;
							context.drawImage(enemyShipImage,enemy[i].x,enemy[i].y);
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
					context.fillStyle = '#2C98DB';
					context.font = '14pt Arial';
					context.fillText("HEALTH: " + life + "%",20,22);
					context.fillText("LEVEL: " + level,width-100,22);
				}
			
			
			for (var i = 0 ;i<bulletIndex ; i++)
				{
					if (bullets[i].alive==1) context.drawImage(bulletImage,bullets[i].x,bullets[i].y);
				}
			
			for (var i = 0 ;i<missileIndex ; i++)
				{
					if (missiles[i].alive==1) context.drawImage(missileImage,missiles[i].x,missiles[i].y);
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
					backgroundMusic.pause();
					gameoverMusic.play();
					timer_RESTART=setInterval(restart,10);
				}
    }
	
	function moveEnemy()
	{		//choose left or right
			var temp1,temp2;

			if (direction_LR==0) temp1 = 10;
			else temp1 = -10;
			
			if (enemy[0].x - 10 < 0)
				{
					temp1 = 10;
					direction_LR=0; //enemy at the left border, so its turned to right
				}
			else if (enemy[nEnemy-1].x + 10 > backgroundImage.width-enemyShipImage.width)
				{
					temp1 = -10;
					direction_LR=1; //enemy at the right border, so its turned to left
				}
			//
			
			//choose Top or Bottom
			if (direction_TB==0) temp2 = 10;
			else  temp2 = -10;
			
			if (enemy[0].y - 10 < 30)
				{
					temp2 = 10;
					direction_TB=0; //enemy at the upper border, so its turned down
				}
			else if (enemy[nEnemy-1].y + 10 > (height+shuttleImage.height)/2 - enemyShipImage.height)
				{
					temp2 = -10;
					direction_TB=1; //enemy at the lower border, so its turned up
				}
			//
			
			for (var i = 0 ;i<nEnemy ; i++)
				{
					enemy[i].x += temp1;
					enemy[i].y += temp2;
				}
	}
	
	function startShooting()
	{
			var temp=0;
			for (var i = 0 ;i<nEnemy ; i++)
				{
					if (enemy[i].alive==1)
						{
							if (temp<fireRate) //keep running the loop until it comes to fireRate
								{
									bullets[bulletIndex] = {alive:1, x:enemy[i].x, y:enemy[i].y};
									bulletIndex++;
								}
							temp++;
						}
				}
			
	}
		
	function keepShooting()
	{
			for (var i = 0 ;i<bulletIndex ; i++)
				{
					if (bullets[i].alive==1)
						{
							bullets[i].y+=bulletSpeed; //move bullet down
														
							if(bullets[i].y>height) //check if it has passed the bottom border
								{
									bullets[i].alive=0;
								}
							
							//check collision with spaceship
							if (bullets[i].x > x && bullets[i].x < x + shuttleImage.width)
								{
								if (bullets[i].y > y &&  bullets[i].y < (y+ shuttleImage.height) )
									{
									bullets[i].alive=0;
									life-=damage; //reduce no of lives
									}
								}
							
						}
				}	
			
				for (var i = 0 ;i<missileIndex ; i++)
				{
					if (missiles[i].alive==1)
						{
							missiles[i].y-=5;
							
							if(missiles[i].y<30) //check if it has passed the top border
								{
									missiles[i].alive=0;
								}
							
							//check collision with enemyShipImages
						for (var j = 0 ;j<nEnemy ; j++)
						{
					
							if (enemy[j].alive==1)
								{
									if (missiles[i].x > enemy[j].x && missiles[i].x < enemy[j].x + enemyShipImage.width)
									{
										if (missiles[i].y > enemy[j].y &&  missiles[i].y < (enemy[j].y+ enemyShipImage.height) )
										{
											missiles[i].alive=0;
											enemy[j].health-=25; //reduce the helath
											//check if its destroyed
											if (enemy[j].health<1)
												{
													sound_BLAST.play();
													enemy[j].alive=0;
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
					sound_SHOOTING.play();
					missiles[missileIndex] = {alive:1, x:x+(shuttleImage.width-missileImage.width)/2, y:y};
					missileIndex++;
					shootOn=0;
				}
	}
	
	function EventKeyPress(e) {   key= e.keyCode;   };
	
	function setLevelData()
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
				backgroundImage.src = 'images/bg1.png';
				enemyShipImage.src = 'images/enemy1.png';
				
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
			
				enemyShipImage.src = 'images/enemy'+ (level%10) + '.png'; //10 images for enemy named as enemy0....enemy9
				backgroundImage.src = 'images/bg'+ (level%5) +'.png'; //5 images for background named as bg0....enemy4
			}
		
		
		 window.setTimeout(function(){ // added to delay so that enemy images are loaded. if not enemyShipImage.height/width = 0
						   
		 //initial pos of enemy ships
			for (var i = 0 ;i<nEnemy ; i++)
				{
					var tempX=(enemyShipImage.width*i)+(i*10),tempY=30,j;
					
					if (i>(nEnemy/2)-1) //second row
						{
						j=i-(nEnemy/2);
						tempY+=	enemyShipImage.height+10;
						tempX=(enemyShipImage.width*j)+(j*10);
						}
					
					enemy[i]= {alive:1, health:health, x:tempX, y:tempY};
				
				}
						   
						   
		 },500);
		
	}