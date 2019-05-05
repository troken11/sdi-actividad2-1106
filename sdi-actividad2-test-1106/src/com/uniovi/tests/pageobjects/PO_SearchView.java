package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_SearchView extends PO_NavView {
	static public void fillForm(WebDriver driver, String prdp) {
		WebElement we = driver.findElement(By.name("busqueda"));
		we.click();
		we.clear();
		we.sendKeys(prdp);
		By boton = By.id("buscar");
		driver.findElement(boton).click();
	}
}