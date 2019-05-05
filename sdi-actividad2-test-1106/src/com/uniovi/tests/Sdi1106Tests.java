package com.uniovi.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;

import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.uniovi.tests.pageobjects.*;
import com.uniovi.tests.util.SeleniumUtils;

public class Sdi1106Tests {
	
	// En mi pc
	static String PathFirefox64 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\Program Files\\Mozilla Firefox\\gecko\\geckodriver024win64.exe";	
	//ComÃºna Windows y a MACOSX
	static WebDriver driver= getDriver(PathFirefox64, Geckdriver024);
	
	/**
	 * URLs
	 */
	static String URLlocal = "https://localhost:8081";
	//static String URLremota = "http://ec2-54-158-32-91.compute-1.amazonaws.com:8080";
	
	static String URL= URLlocal;	
	
	public static WebDriver getDriver(String PathFirefox, String Geckdriver){
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}
	
	// Antes de cada prueba se navega al URL home de la aplicaciÃ³n
	@Before
	public void setUp(){
		driver.navigate().to(URL);
	}
	//DespuÃ©s de cada prueba se borran las cookies del navegador
	@After 
	public void tearDown(){
		driver.manage().deleteAllCookies();
	}
	//Antes de la primera prueba
	@BeforeClass
	static public void begin() {
		driver.navigate().to(URL);
		initdb();
	}
	//Al finalizar la Ãºltima prueba 
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}
	
	@Test
	public void contextLoads() {
	}
	
	//PR01. 
	//Registro de Usuario con datos válidos.
	@Test
	public void PR01() {
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "josefo@email.com", "Josefo", "Perez", "77777", "77777");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");		
	}

	//PR02. 
	//Registro de Usuario con datos invalidos   
	@Test
	public void PR02() {
		//Email vacio
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "", "Ramon", "Perez", "77777", "77777");
		PO_View.checkElement(driver, "text", "Existen campos vacios");	
		
		//Passwords distintas
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "josefo@email.com", "Josefo", "Perez", "77777", "66666");
		PO_View.checkElement(driver, "text", "Las contraseñas no coinciden");
	}

	//PR03. 
	//Registro de Usuario con datos invalidos
	// (usuario existente)
	@Test
	public void PR03() {
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "josefo@email.com", "Josefo", "Perez", "77777", "77777");
		PO_View.checkElement(driver, "text", "Error. Usuario ya existente");	
	}
	
	//PR04. 
	// Inicio de sesión con datos válidos.
	@Test
	public void PR04() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "josefo@email.com", "77777");
		PO_View.checkElement(driver, "text", "Bienvenido");	
		PO_View.checkElement(driver, "text", "100.0");	
	}
	
	// PR05.
	// Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta).
	@Test
	public void PR05() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "josefo@email.com", "66666");
		PO_View.checkElement(driver, "text", "Email o password incorrecto");	
	}

	// PR06. Login de Usuario con datos vÃ¡lidos  (Usuario)
	@Test
	public void PR06() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "josefo@email.com", "");
		PO_View.checkElement(driver, "text", "Existen campos vacios");	
	}

	// PR07. Login de Usuario con datos invÃ¡lidos
	// (email vacÃ­o, password vacia)
	@Test
	public void PR07() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "invent@email.com", "578945");
		PO_View.checkElement(driver, "text", "Email o password incorrecto");	
	}

	// PR08.
	@Test
	public void PR08() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_NavView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		PO_View.checkURL(driver, URL + "/identificarse");
	}

	// PR09. 
	@Test
	public void PR09() {
		try {
			PO_View.checkElement(driver, "text", "Desconectar");
			fail();
		}catch(TimeoutException e){}
	}

	// PR10.
	@Test
	public void PR10() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_NavView.clickOption(driver, "//a[@id='menu-users']");
		PO_NavView.clickOption(driver, "usuario/lista", "class", "table table-hover");
		PO_View.checkElement(driver, "text", "fantasma@email.com");	
		PO_View.checkElement(driver, "text", "marcos@email.com");
		PO_View.checkElement(driver, "text", "lucia@email.com");	
		PO_View.checkElement(driver, "text", "borrar1@email.com");
		PO_View.checkElement(driver, "text", "borrar2@email.com");
		PO_View.checkElement(driver, "text", "borrar3@email.com");
	}

	
	// PR11. BotÃ³n de cerrar sesiÃ³n no visible si no estÃ¡s logeado
	@Test
	public void PR11() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_NavView.clickOption(driver, "//a[@id='menu-users']");
		PO_NavView.clickOption(driver, "usuario/lista", "class", "table table-hover");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "@class", "user",
				PO_View.getTimeout()).size();
		
		driver.findElement(By.id("0")).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();
		
		int recuento2  = SeleniumUtils.EsperaCargaPagina(driver, "@class", "user",
				PO_View.getTimeout()).size();
		assertEquals(recuento1 - recuento2, 1);
	}
	
	// PR12. Mostrar listado de usuarios
	@Test
	public void PR12() {
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "nuevo@email.com", "Gonzalo", "Martinez", "11111", "11111");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");	
		PO_NavView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_NavView.clickOption(driver, "//a[@id='menu-users']");
		PO_NavView.clickOption(driver, "usuario/lista", "class", "table table-hover");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "@class", "user",
				PO_View.getTimeout()).size();
		
		driver.findElement(By.id("8")).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();
		
		int recuento2  = SeleniumUtils.EsperaCargaPagina(driver, "@class", "user",
				PO_View.getTimeout()).size();
		assertEquals(recuento1 - recuento2, 1);
	}
	
	// PR13. Borrar primer usuario
	@Test
	public void PR13() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_NavView.clickOption(driver, "//a[@id='menu-users']");
		PO_NavView.clickOption(driver, "usuario/lista", "class", "table table-hover");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "@class", "user",
				PO_View.getTimeout()).size();
		
		driver.findElement(By.id("0")).click();
		driver.findElement(By.id("2")).click();
		driver.findElement(By.id("4")).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();

		int recuento2  = SeleniumUtils.EsperaCargaPagina(driver, "@class", "user",
				PO_View.getTimeout()).size();
		assertEquals(recuento1 - recuento2, 3);
	}
	

	// PR14. 
	@Test
	public void PR14() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "lucia@email.com", "pass");
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/agregar", "id", "titulo");	
		
		PO_ItemView.fillForm(driver, "Peonza", "de madera", "4.56");		
		PO_View.checkElement(driver, "text", "Peonza");	
	}

	// PR15. Borrar ultimo usuario
	@Test
	public void PR15() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "lucia@email.com", "pass");
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/agregar", "id", "titulo");	
		
		PO_ItemView.fillForm(driver, "", "Muy bonito", "5.5");		
		PO_View.checkElement(driver, "text", "Existen campos vacios");	
	}
	
	// PR16. AÃ±adir una oferta nueva
	@Test
	public void PR16() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "marcos@email.com", "pass");
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/agregar", "id", "titulo");	
		
		PO_ItemView.fillForm(driver, "Luces", "LED", "10.2");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/agregar", "id", "titulo");	
		
		PO_ItemView.fillForm(driver, "Teclado", "con luces", "18.3");
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/agregar", "id", "titulo");	
		
		PO_ItemView.fillForm(driver, "Cluedo", "Juego de mesa", "20.45");
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
		PO_View.checkElement(driver, "text", "Luces");	
		PO_View.checkElement(driver, "text", "Teclado");		
		PO_View.checkElement(driver, "text", "Cluedo");
	}
	
	
	
	// PR17. AÃ±adir una oferta incorrecta
	@Test
	public void PR17() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "marcos@email.com", "pass");	

		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
				
		PO_View.checkElement(driver, "text", "Teclado");
		PO_View.checkElement(driver, "text", "Cluedo");
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout()).size();

		PO_NavView.clickOption(driver, "//button[@id='Luces']");
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
		int recuento2 = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout()).size();

		assertEquals(recuento1 - recuento2, 1);
	}


	// PR18. Ver todos mis productos
	@Test
	public void PR18() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "marcos@email.com", "pass");	

		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
				
		PO_View.checkElement(driver, "text", "Teclado");
		PO_View.checkElement(driver, "text", "Cluedo");
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout()).size();

		PO_NavView.clickOption(driver, "//button[@id='Cluedo']");
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
		int recuento2 = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout()).size();

		assertEquals(recuento1 - recuento2, 1);
	}


	// PR19. Borrar mi primera oferta
	@Test
	public void PR19() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "javier@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/tienda", "class", "table table-hover");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "class", "oferta",
				PO_View.getTimeout()).size();
		
		assertEquals(recuento1, 4);
	}

	// PR20. 
	@Test
	public void PR20() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "javier@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/tienda", "class", "table table-hover");		
		
		PO_SearchView.fillForm(driver, "asdf");
		
		// Deberia de fallar al no obtener ningun elemento
		try {
			@SuppressWarnings("unused")
			int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "class", "oferta",
					PO_View.getTimeout()).size();
			fail();
		} catch(TimeoutException te) {
			
		}
	}

	// PR21.
	@Test
	public void PR21() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "javier@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/tienda", "class", "table table-hover");		
		
		PO_SearchView.fillForm(driver, "tec");
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "class", "oferta",
				PO_View.getTimeout()).size();
		
		assertEquals(recuento1, 1);
		
		PO_View.checkElement(driver, "text", "Teclado");
	}

	// PR22.
	@Test
	public void PR22() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "javier@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/tienda", "class", "table table-hover");		
		
		List<WebElement> we = driver.findElements(By.id("comprar"));
		we.get(1).click();
		
		String myMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		if (!myMoney.equals("60.00 €")) {
			fail();
		}
	}

	// PR23.
	@Test
	public void PR23() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "fantasma@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/tienda", "class", "table table-hover");		
		
		List<WebElement> we = driver.findElements(By.id("comprar"));
		we.get(1).click();
		
		String myMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		if (!myMoney.equals("0.00 €")) {
			fail();
		}
	}

	// PR24.
	@Test
	public void PR24() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "fantasma@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/tienda", "class", "table table-hover");		
		
		List<WebElement> we = driver.findElements(By.id("comprar"));
		we.get(1).click();
		
		String myMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		if (!myMoney.equals("0.00 €")) {
			fail();
		}
		PO_View.checkElement(driver, "text", "No dispones de dinero suficiente");	
	}


	// PR25.
	@Test
	public void PR25() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "javier@email.com", "pass");	
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/compradas", "class", "table table-hover");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "class", "comprada",
				PO_View.getTimeout()).size();
		
		assertEquals(recuento1, 1);
	}

	// PR26. 
	// Ver productos que he comprado
	// Al crear una oferta marcar dicha oferta como destacada y a continuación comprobar: i) que
	// aparece en el listado de ofertas destacadas para los usuarios y que el saldo del usuario se actualiza
	// adecuadamente en la vista del ofertante (-20).
	@Test
	public void PR26() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "javier@email.com", "pass");
		
		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/agregar", "id", "titulo");	
		
		String preMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		PO_ItemView.fillFormPremium(driver, "PSP", "Vita", "60.50");		
		PO_View.checkElement(driver, "text", "PSP");	
		
		String postMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		if (!(Double.parseDouble(postMoney.split(" ")[0]) + 20 == Double.parseDouble(preMoney.split(" ")[0]))) {
			fail();
		}
	}
	
	
	
	// PR27.
	// Sobre el listado de ofertas de un usuario con más de 20 euros de saldo, pinchar en el enlace
	// Destacada y a continuación comprobar: i) que aparece en el listado de ofertas destacadas para los
	// usuarios y que el saldo del usuario se actualiza adecuadamente en la vista del ofertante (-20).
	@Test
	public void PR27() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "marcos@email.com", "pass");	

		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
		String preMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		List<WebElement> we = driver.findElements(By.name("destacada"));
		we.get(0).click();
		
		String postMoney = driver.findElement(By.xpath("//li[@id='my-money']")).getAttribute("innerHTML");
		
		if (!(Double.parseDouble(postMoney.split(" ")[0]) + 20 == Double.parseDouble(preMoney.split(" ")[0]))) {
			fail();
		}
	}
	
	// PR28.
	// Sobre el listado de ofertas de un usuario con menos de 20 euros de saldo, pinchar en el
	// enlace Destacada y a continuación comprobar que se muestra el mensaje de saldo no suficiente.
	@Test
	public void PR28() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "lucia@email.com", "pass");	

		PO_NavView.clickOption(driver, "//a[@id='items-menu']");
		PO_NavView.clickOption(driver, "oferta/lista", "class", "table table-hover");	
		
		List<WebElement> we = driver.findElements(By.name("destacada"));
		we.get(0).click();
		
		PO_View.checkElement(driver, "text", "No tienes suficiente dinero para destacar la oferta");
	}

	
	/**
	 * 2B
	 */	
	
	
	// PR29.
	// Inicio de sesión con datos válidos.
	@Test
	public void PR29() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		//driver.navigate().to(URL + "/cliente.html?w=login");
		PO_LoginView.fillFormDontSend(driver, "fantasma@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		PO_View.checkElement(driver, "text", "Nombre");
	}

	// PR30.
	// Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta).
	@Test
	public void PR30() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		//driver.navigate().to(URL + "/cliente.html?w=login");
		PO_LoginView.fillForm(driver, "fantasma@email.com", "fallo");
		PO_View.checkElement(driver, "text", "Usuario no encontrado");
	}
	
	// PR31.
	// Inicio de sesión con datos válidos (campo email o contraseña vacíos).
	@Test
	public void PR31() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		//driver.navigate().to(URL + "/cliente.html?w=login");
		PO_LoginView.fillForm(driver, "fantasma@email.com", "");
		PO_View.checkElement(driver, "text", "Existen campos vacios");
	}
	
	
	// PR32.
	// Mostrar el listado de ofertas disponibles y comprobar que se muestran todas las que existen,
	// menos las del usuario identificado.
	@Test
	public void PR32() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		int recuento = SeleniumUtils.EsperaCargaPagina(driver, "class", "oferta",
				PO_View.getTimeout()).size();
		
		assertEquals(recuento, 6);
		
		try {
			PO_View.checkElement(driver, "text", "javier@email.com");
			fail();
		} catch(TimeoutException te) {
			
		}
	}

	
	// PR33.
	// Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un mensaje a
	// una oferta concreta. Se abriría dicha conversación por primera vez. Comprobar que el mensaje aparece
	// en el listado de mensajes.
	@Test
	public void PR33() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_View.clickFirstById(driver, "conversar", "id", "message-send");	
		
		WebElement text = driver.findElement(By.id("message-send"));
		text.click();
		text.clear();
		text.sendKeys("Hola, me interesa");
		By boton = By.className("btn");
		driver.findElement(boton).click();
		
		int recuento2 = SeleniumUtils.EsperaCargaPagina(driver, "class", "message-line",
				PO_View.getChatTimeout()).size();
		
		assertEquals(recuento2, 1);
	}	
	// PR34.
	// Sobre el listado de conversaciones enviar un mensaje a una conversación ya abierta.
	// Comprobar que el mensaje aparece en el listado de mensajes.
	@Test
	public void PR34() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "marcos@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	
		
		PO_View.clickFirstById(driver, "reanudar", "id", "message-send");	
		
		WebElement text = driver.findElement(By.id("message-send"));
		text.click();
		text.clear();
		text.sendKeys("Me alegro");
		By boton = By.className("btn");
		driver.findElement(boton).click();
		
		SeleniumUtils.EsperaCargaPagina(driver, "text", "marcos@email.com:", PO_View.getChatTimeout());
		
		int recuento2 = SeleniumUtils.EsperaCargaPagina(driver, "class", "message-line",
				PO_View.getTimeout()).size();
		
		assertEquals(recuento2, 2);
	}

	// PR30.
	@Test
	public void PR35() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_View.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	

		int recuento = SeleniumUtils.EsperaCargaPagina(driver, "id", "reanudar",
				PO_View.getChatTimeout()).size();
		
		assertEquals(recuento, 3);
	}
	

	// PR30. Seguridad 3
	@Test
	public void PR36() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "class", "conversacion-abierta",
				PO_View.getChatTimeout()).size();
		
		PO_View.clickFirstById(driver, "eliminar", "text", "Conversacion eliminada");	
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	
		
		int recuento2 = SeleniumUtils.EsperaCargaPagina(driver, "class", "conversacion-abierta",
				PO_View.getChatTimeout()).size();
		
		assertEquals(recuento1 - recuento2, 1);
	}

	// PR30.
	@Test
	public void PR37() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	
		
		int recuento1 = SeleniumUtils.EsperaCargaPagina(driver, "class", "conversacion-abierta",
				PO_View.getTimeout()).size();
		
		PO_View.clickLastById(driver, "eliminar", "text", "Conversacion eliminada");
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");
		
		int recuento2 = SeleniumUtils.EsperaCargaPagina(driver, "class", "conversacion-abierta",
				PO_View.getTimeout()).size();
		
		assertEquals(recuento1 - recuento2, 1);
	}

	// PR30.
	@Test
	public void PR38() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_View.clickFirstById(driver, "conversar", "id", "message-send");	
		
		WebElement text = driver.findElement(By.id("message-send"));
		text.click();
		text.clear();
		text.sendKeys("Me rebajas 1 euro?");
		By boton = By.className("btn");
		driver.findElement(boton).click();
	
		// Comprobarla
		
		PO_NavView.clickOptionById(driver, "login-button", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "marcos@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	
		
		PO_View.clickFirstById(driver, "reanudar", "id", "message-send");	
		
		try {
			PO_View.checkElement(driver, "text", "(leido)", 0);	
			fail();
		}
		catch (TimeoutException te) {		
		}	
		SeleniumUtils.EsperaCargaPagina(driver, "text", "(leido)", PO_View.getChatTimeout());		
	}

	// PR30.
	@Test
	public void PR39() {
		PO_NavView.clickOption(driver, "/cliente.html?w=login", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "javier@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_View.clickFirstById(driver, "conversar", "id", "message-send");	
		
		WebElement text = driver.findElement(By.id("message-send"));
		text.click();
		text.clear();
		text.sendKeys("Me rebajas 1 euro?");
		By boton = By.className("btn");
		driver.findElement(boton).click();
		
		text = driver.findElement(By.id("message-send"));
		text.click();
		text.clear();
		text.sendKeys("Si es asi, te lo compro");
		boton = By.className("btn");
		driver.findElement(boton).click();
		
		text = driver.findElement(By.id("message-send"));
		text.click();
		text.clear();
		text.sendKeys("Gracias");
		boton = By.className("btn");
		driver.findElement(boton).click();
	
		// Comprobarla
		
		PO_NavView.clickOptionById(driver, "login-button", "id", "widget-login");	
		PO_LoginView.fillFormDontSend(driver, "marcos@email.com", "pass");
		PO_View.clickOptionById(driver, "boton-login", "class", "table table-hover");	
		
		PO_NavView.clickOptionById(driver, "conver-button", "id", "widget-conversaciones");	
		
		PO_View.clickFirstById(driver, "reanudar", "id", "message-send");	
		
		PO_View.checkElement(driver, "text", "Mensajes no leidos: 3");		
	}
	
	
	
	
	
	public static void initdb() {
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		driver.navigate().to(URL + "/reset");
		
		
	}


}