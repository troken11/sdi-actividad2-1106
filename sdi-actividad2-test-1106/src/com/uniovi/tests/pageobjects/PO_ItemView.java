package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ItemView extends PO_NavView {
	
	static public void fillForm(WebDriver driver, String titulo, String detalles, String money) {
		WebElement title = driver.findElement(By.name("titulo"));
		title.click();
		title.clear();
		title.sendKeys(titulo);
		WebElement description = driver.findElement(By.name("detalles"));
		description.click();
		description.clear();
		description.sendKeys(detalles);
		WebElement price = driver.findElement(By.name("precio"));
		price.click();
		price.clear();
		price.sendKeys(money);
		//Pulsar el boton de Alta.
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
	
	static public void fillFormPremium(WebDriver driver, String titulo, String detalles, String money) {
		WebElement title = driver.findElement(By.name("titulo"));
		title.click();
		title.clear();
		title.sendKeys(titulo);
		WebElement description = driver.findElement(By.name("detalles"));
		description.click();
		description.clear();
		description.sendKeys(detalles);
		WebElement price = driver.findElement(By.name("precio"));
		price.click();
		price.clear();
		price.sendKeys(money);
		WebElement dest = driver.findElement(By.name("destacada"));
		dest.click();
		//Pulsar el boton de Alta.
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
	
	static public void search(WebDriver driver, String text) {
		WebElement title = driver.findElement(By.name("searchText"));
		title.click();
		title.clear();
		title.sendKeys(text);
		//Pulsar el boton de Alta.
		By boton = By.id("search");
		driver.findElement(boton).click();
	}

}

