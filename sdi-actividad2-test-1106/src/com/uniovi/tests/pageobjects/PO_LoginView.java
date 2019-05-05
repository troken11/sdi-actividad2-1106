package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_LoginView extends PO_NavView {
	
	static public void fillForm(WebDriver driver, String email, String pass) {
		WebElement mail = driver.findElement(By.name("email"));
		mail.click();
		mail.clear();
		mail.sendKeys(email);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(pass);
		//Pulsar el boton de Alta.
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
	
	static public void fillFormDontSend(WebDriver driver, String email, String pass) {
		WebElement mail = driver.findElement(By.name("email"));
		mail.click();
		mail.clear();
		mail.sendKeys(email);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(pass);
	}
}